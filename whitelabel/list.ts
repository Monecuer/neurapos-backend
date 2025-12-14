import { api } from "encore.dev/api";
import db from "../db";

interface WhiteLabelPartner {
  id: string;
  name: string;
  brandingMeta: Record<string, any>;
  enabled: boolean;
  allowedMerchants: string[];
  deviceLimits: Record<string, any>;
  createdAt: Date;
}

interface ListWhiteLabelResponse {
  partners: WhiteLabelPartner[];
}

// Retrieves all white-label partners.
export const list = api<void, ListWhiteLabelResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/admin/white-label" },
  async () => {
    const partners = await db.queryAll<WhiteLabelPartner>`
      SELECT 
        id,
        name,
        branding_meta as "brandingMeta",
        enabled,
        allowed_merchants as "allowedMerchants",
        device_limits as "deviceLimits",
        created_at as "createdAt"
      FROM white_label_partners
      ORDER BY created_at DESC
    `;

    return { partners };
  }
);
