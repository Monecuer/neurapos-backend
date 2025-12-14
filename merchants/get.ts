import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetMerchantRequest {
  id: string;
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

// Retrieves a single merchant by ID.
export const get = api<GetMerchantRequest, Merchant>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/merchants/:id" },
  async (req) => {
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
      WHERE id = ${req.id}
    `;

    if (!merchant) {
      throw APIError.notFound("merchant not found");
    }

    return merchant;
  }
);
