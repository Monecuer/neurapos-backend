import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListAuditLogsRequest {
  targetType?: Query<string>;
  targetId?: Query<string>;
  action?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface AuditLog {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

interface ListAuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

// Retrieves audit logs with optional filtering.
export const list = api<ListAuditLogsRequest, ListAuditLogsResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/admin/audit" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.targetType) {
      whereClause += ` AND target_type = $${paramIndex++}`;
      params.push(req.targetType);
    }

    if (req.targetId) {
      whereClause += ` AND target_id = $${paramIndex++}`;
      params.push(req.targetId);
    }

    if (req.action) {
      whereClause += ` AND action = $${paramIndex++}`;
      params.push(req.action);
    }

    const countQuery = `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    const query = `
      SELECT 
        id,
        actor_id as "actorId",
        actor_role as "actorRole",
        action,
        target_type as "targetType",
        target_id as "targetId",
        reason,
        metadata,
        created_at as "createdAt"
      FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const logs = await db.rawQueryAll<AuditLog>(query, ...params, limit, offset);

    return { logs, total };
  }
);
