import { api } from "encore.dev/api";
import db from "../db";

interface CreateAuditLogRequest {
  actorId?: string;
  actorRole?: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  metadata?: Record<string, any>;
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

// Creates an audit log entry.
export const createAuditLog = async (req: CreateAuditLogRequest): Promise<void> => {
  const id = `AL-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  await db.exec`
    INSERT INTO audit_logs (
      id, actor_id, actor_role, action, target_type, target_id, reason, metadata
    )
    VALUES (
      ${id}, ${req.actorId || null}, ${req.actorRole || null}, ${req.action},
      ${req.targetType}, ${req.targetId}, ${req.reason || null},
      ${req.metadata ? JSON.stringify(req.metadata) : null}
    )
  `;
};

// Retrieves audit logs with optional filtering.
export const create = api<CreateAuditLogRequest, AuditLog>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/admin/audit" },
  async (req) => {
    const id = `AL-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.exec`
      INSERT INTO audit_logs (
        id, actor_id, actor_role, action, target_type, target_id, reason, metadata
      )
      VALUES (
        ${id}, ${req.actorId || null}, ${req.actorRole || null}, ${req.action},
        ${req.targetType}, ${req.targetId}, ${req.reason || null},
        ${req.metadata ? JSON.stringify(req.metadata) : null}
      )
    `;

    const log = await db.queryRow<AuditLog>`
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
      WHERE id = ${id}
    `;

    if (!log) {
      throw new Error("Failed to create audit log");
    }

    return log;
  }
);
