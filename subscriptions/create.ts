// Internal subscriptions create logic for gateway
export async function create(req: any, ctx: any) {
  // TODO: Implement actual subscription creation logic
  return { success: true };
}
  graceDays: number;
  enforcementMode: string;
  createdAt: Date;
}

// Creates a new subscription for a merchant.
export const create = api<CreateSubscriptionRequest, Subscription>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/subscriptions" },
  async (req) => {
    const id = `SUB-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.exec`
      INSERT INTO subscriptions (
        id, merchant_id, plan, start_date, end_date, grace_days, enforcement_mode
      )
      VALUES (
        ${id}, ${req.merchantId}, ${req.plan}, ${req.startDate},
        ${req.endDate || null}, ${req.graceDays || 7},
        ${req.enforcementMode || "limited_after_grace"}
      )
    `;

    const subscription = await db.queryRow<Subscription>`
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
      WHERE id = ${id}
    `;

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    await createAuditLog({
      action: "subscription_created",
      targetType: "subscription",
      targetId: id,
      metadata: { merchantId: req.merchantId, plan: req.plan },
    });

    return subscription;
  }
);
