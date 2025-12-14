import { api, APIError } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";

interface UpdateMerchantRequest {
  id: string;
  name?: string;
  planId?: string;
  status?: string;
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

// Updates a merchant's details.
export const update = api<UpdateMerchantRequest, Merchant>(
  { auth: true, expose: true, method: "PATCH", path: "/api/v1/merchants/:id" },
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(req.name);
    }
    if (req.planId !== undefined) {
      updates.push(`plan_id = $${paramIndex++}`);
      params.push(req.planId);
    }
    if (req.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(req.status);
    }
    if (req.contactEmail !== undefined) {
      updates.push(`contact_email = $${paramIndex++}`);
      params.push(req.contactEmail);
    }
    if (req.contactPhone !== undefined) {
      updates.push(`contact_phone = $${paramIndex++}`);
      params.push(req.contactPhone);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE merchants 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        name,
        plan_id as "planId",
        status,
        contact_email as "contactEmail",
        contact_phone as "contactPhone",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    params.push(req.id);
    const merchant = await db.rawQueryRow<Merchant>(query, ...params);

    if (!merchant) {
      throw APIError.notFound("merchant not found");
    }

    await createAuditLog({
      action: "merchant_updated",
      targetType: "merchant",
      targetId: req.id,
      metadata: req,
    });

    return merchant;
  }
);
