import { api } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";

interface ToggleFeatureRequest {
  scopeType: string;
  scopeId: string;
  featureKey: string;
  enabled: boolean;
  scheduledFrom?: Date;
  scheduledTo?: Date;
}

interface FeatureFlag {
  id: string;
  scopeType: string;
  scopeId: string;
  featureKey: string;
  enabled: boolean;
  scheduledFrom: Date | null;
  scheduledTo: Date | null;
  createdAt: Date;
}

// Toggles a feature flag for a specific scope.
export const toggle = api<ToggleFeatureRequest, FeatureFlag>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/admin/feature-flags" },
  async (req) => {
    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM feature_flags
      WHERE scope_type = ${req.scopeType}
        AND scope_id = ${req.scopeId}
        AND feature_key = ${req.featureKey}
    `;

    if (existing) {
      await db.exec`
        UPDATE feature_flags
        SET enabled = ${req.enabled},
            scheduled_from = ${req.scheduledFrom || null},
            scheduled_to = ${req.scheduledTo || null},
            updated_at = NOW()
        WHERE id = ${existing.id}
      `;

      const updated = await db.queryRow<FeatureFlag>`
        SELECT 
          id,
          scope_type as "scopeType",
          scope_id as "scopeId",
          feature_key as "featureKey",
          enabled,
          scheduled_from as "scheduledFrom",
          scheduled_to as "scheduledTo",
          created_at as "createdAt"
        FROM feature_flags
        WHERE id = ${existing.id}
      `;

      if (!updated) {
        throw new Error("Failed to update feature flag");
      }

      await createAuditLog({
        action: "feature_flag_updated",
        targetType: "feature_flag",
        targetId: existing.id,
        metadata: req,
      });

      return updated;
    } else {
      const id = `FF-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      await db.exec`
        INSERT INTO feature_flags (
          id, scope_type, scope_id, feature_key, enabled, scheduled_from, scheduled_to
        )
        VALUES (
          ${id}, ${req.scopeType}, ${req.scopeId}, ${req.featureKey},
          ${req.enabled}, ${req.scheduledFrom || null}, ${req.scheduledTo || null}
        )
      `;

      const created = await db.queryRow<FeatureFlag>`
        SELECT 
          id,
          scope_type as "scopeType",
          scope_id as "scopeId",
          feature_key as "featureKey",
          enabled,
          scheduled_from as "scheduledFrom",
          scheduled_to as "scheduledTo",
          created_at as "createdAt"
        FROM feature_flags
        WHERE id = ${id}
      `;

      if (!created) {
        throw new Error("Failed to create feature flag");
      }

      await createAuditLog({
        action: "feature_flag_created",
        targetType: "feature_flag",
        targetId: id,
        metadata: req,
      });

      return created;
    }
  }
);
