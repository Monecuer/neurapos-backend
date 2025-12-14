import { api } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";

interface CreateMerchantRequest {
  name: string;
  planId?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface Merchant {
  id: string;
  name: string;
  planId: string;
  status: string;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new merchant.
export const create = api<CreateMerchantRequest, Merchant>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/merchants" },
  async (req) => {
    const id = `M-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.exec`
      INSERT INTO merchants (id, name, plan_id, contact_email, contact_phone)
      VALUES (${id}, ${req.name}, ${req.planId || "starter"}, ${req.contactEmail || null}, ${req.contactPhone || null})
    `;

    const merchant = await db.queryRow<Merchant>`
      SELECT 
        id,
        name,
        plan_id as "planId",
        status,
        contact_email as "contactEmail",
        contact_phone as "contactPhone",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM merchants
      WHERE id = ${id}
    `;

    if (!merchant) {
      throw new Error("Failed to create merchant");
    }

    await createAuditLog({
      action: "merchant_created",
      targetType: "merchant",
      targetId: id,
      metadata: { name: req.name, planId: req.planId || "starter" },
    });

    return merchant;
  }
);
