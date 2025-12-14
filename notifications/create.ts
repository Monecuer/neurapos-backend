import { api } from "encore.dev/api";
import db from "../db";

interface CreateNotificationRequest {
  recipientType: string;
  recipientId: string;
  severity?: string;
  title: string;
  message: string;
  enforcementHint?: string;
}

interface Notification {
  id: string;
  recipientType: string;
  recipientId: string;
  severity: string;
  title: string;
  message: string;
  enforcementHint: string | null;
  read: boolean;
  createdAt: Date;
}

// Creates a new notification.
export const createNotification = async (
  req: CreateNotificationRequest
): Promise<void> => {
  const id = `N-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  await db.exec`
    INSERT INTO notifications (
      id, recipient_type, recipient_id, severity, title, message, enforcement_hint
    )
    VALUES (
      ${id}, ${req.recipientType}, ${req.recipientId}, ${req.severity || "info"},
      ${req.title}, ${req.message}, ${req.enforcementHint || null}
    )
  `;
};

export const create = api<CreateNotificationRequest, Notification>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/notifications" },
  async (req) => {
    const id = `N-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.exec`
      INSERT INTO notifications (
        id, recipient_type, recipient_id, severity, title, message, enforcement_hint
      )
      VALUES (
        ${id}, ${req.recipientType}, ${req.recipientId}, ${req.severity || "info"},
        ${req.title}, ${req.message}, ${req.enforcementHint || null}
      )
    `;

    const notification = await db.queryRow<Notification>`
      SELECT 
        id,
        recipient_type as "recipientType",
        recipient_id as "recipientId",
        severity,
        title,
        message,
        enforcement_hint as "enforcementHint",
        read,
        created_at as "createdAt"
      FROM notifications
      WHERE id = ${id}
    `;

    if (!notification) {
      throw new Error("Failed to create notification");
    }

    return notification;
  }
);
