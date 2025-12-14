import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListNotificationsRequest {
  recipientType?: Query<string>;
  recipientId?: Query<string>;
  unreadOnly?: Query<boolean>;
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

interface ListNotificationsResponse {
  notifications: Notification[];
}

// Retrieves notifications with optional filtering.
export const list = api<ListNotificationsRequest, ListNotificationsResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/notifications" },
  async (req) => {
    let query = `
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
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (req.recipientType) {
      query += ` AND recipient_type = $${paramIndex++}`;
      params.push(req.recipientType);
    }

    if (req.recipientId) {
      query += ` AND recipient_id = $${paramIndex++}`;
      params.push(req.recipientId);
    }

    if (req.unreadOnly) {
      query += ` AND read = false`;
    }

    query += " ORDER BY created_at DESC";

    const notifications = await db.rawQueryAll<Notification>(query, ...params);

    return { notifications };
  }
);
