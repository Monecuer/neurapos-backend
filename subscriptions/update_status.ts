import { api, APIError } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";
import { createNotification } from "../notifications/create";

interface UpdateSubscriptionStatusRequest {
  id: string;
  status: string;
  reason?: string;
  scheduledFrom?: Date;
  scheduledTo?: Date;
}

interface Subscription {
  id: string;
  merchantId: string;
  plan: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  graceDays: number;
  enforcementMode: string;
  createdAt: Date;
}

// Updates a subscription's status with enforcement actions.
export const updateStatus = api<UpdateSubscriptionStatusRequest, Subscription>(
  { auth: true, expose: true, method: "PATCH", path: "/api/v1/admin/subscriptions/:id" },
  async (req) => {
    const subscription = await db.queryRow<{ merchantId: string }>`
      SELECT merchant_id as "merchantId" FROM subscriptions WHERE id = ${req.id}
    `;

    if (!subscription) {
      throw APIError.notFound("subscription not found");
    }

    await db.exec`
      UPDATE subscriptions
      SET status = ${req.status},
          change_reason = ${req.reason || null},
          scheduled_from = ${req.scheduledFrom || null},
          scheduled_to = ${req.scheduledTo || null},
          updated_at = NOW()
      WHERE id = ${req.id}
    `;

    const updated = await db.queryRow<Subscription>`
      SELECT 
        id,
        merchant_id as "merchantId",
        plan,
        start_date as "startDate",
        end_date as "endDate",
        status,
        grace_days as "graceDays",
        enforcement_mode as "enforcementMode",
        created_at as "createdAt"
      FROM subscriptions
      WHERE id = ${req.id}
    `;

    if (!updated) {
      throw new Error("Failed to update subscription");
    }

    await createAuditLog({
      action: "subscription_status_changed",
      targetType: "subscription",
      targetId: req.id,
      reason: req.reason,
      metadata: { oldStatus: "active", newStatus: req.status },
    });

    let notificationMessage = "";
    let severity = "info";

    if (req.status === "grace") {
      notificationMessage = "Your subscription has entered grace period. Please update payment.";
      severity = "warning";
    } else if (req.status === "limited") {
      notificationMessage = "Your account is in limited mode. Contact billing to restore full access.";
      severity = "warning";
    } else if (req.status === "suspended") {
      notificationMessage = "Your account has been suspended. Contact support immediately.";
      severity = "error";
    }

    if (notificationMessage) {
      await createNotification({
        recipientType: "merchant",
        recipientId: subscription.merchantId,
        severity,
        title: "Subscription Status Change",
        message: notificationMessage,
      });
    }

    return updated;
  }
);
