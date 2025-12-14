import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListFeatureFlagsRequest {
  scopeType?: Query<string>;
  scopeId?: Query<string>;
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

interface ListFeatureFlagsResponse {
  features: FeatureFlag[];
}

// Retrieves all feature flags with optional filtering.
export const list = api<ListFeatureFlagsRequest, ListFeatureFlagsResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/admin/feature-flags" },
  async (req) => {
    let query = `
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
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (req.scopeType) {
      query += ` AND scope_type = $${paramIndex++}`;
      params.push(req.scopeType);
    }

    if (req.scopeId) {
      query += ` AND scope_id = $${paramIndex++}`;
      params.push(req.scopeId);
    }

    query += " ORDER BY created_at DESC";

    const features = await db.rawQueryAll<FeatureFlag>(query, ...params);

    return { features };
  }
);
