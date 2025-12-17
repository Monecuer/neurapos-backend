// Internal whitelabel create logic for gateway
export async function create(req: any, ctx: any) {
  // TODO: Implement actual whitelabel creation logic
  return { success: true };
}
  enabled: boolean;
  allowedMerchants: string[];
  deviceLimits: Record<string, any>;
  createdAt: Date;
}

// Creates a new white-label partner.
export const create = api<CreateWhiteLabelRequest, WhiteLabelPartner>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/admin/white-label" },
  async (req) => {
    const id = `WL-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.exec`
      INSERT INTO white_label_partners (
        id, name, branding_meta, allowed_merchants, device_limits
      )
      VALUES (
        ${id}, ${req.name}, ${JSON.stringify(req.brandingMeta)},
        ${req.allowedMerchants || []}, ${JSON.stringify(req.deviceLimits || {})}
      )
    `;

    const partner = await db.queryRow<WhiteLabelPartner>`
      SELECT 
        id,
        name,
        branding_meta as "brandingMeta",
        enabled,
        allowed_merchants as "allowedMerchants",
        device_limits as "deviceLimits",
        created_at as "createdAt"
      FROM white_label_partners
      WHERE id = ${id}
    `;

    if (!partner) {
      throw new Error("Failed to create white-label partner");
    }

    await createAuditLog({
      action: "whitelabel_created",
      targetType: "whitelabel",
      targetId: id,
      metadata: { name: req.name },
    });

    return partner;
  }
);
