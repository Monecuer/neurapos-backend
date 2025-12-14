import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListMerchantsRequest {
  status?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
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

interface ListMerchantsResponse {
  merchants: Merchant[];
  total: number;
}

// Retrieves all merchants with optional filtering.
export const list = api<ListMerchantsRequest, ListMerchantsResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/merchants" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereClause = "";
    const params: any[] = [];

    if (req.status) {
      whereClause = "WHERE status = $1";
      params.push(req.status);
    }

    const countQuery = `SELECT COUNT(*) as count FROM merchants ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    const query = `
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
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const merchants = await db.rawQueryAll<Merchant>(query, ...params, limit, offset);

    return { merchants, total };
  }
);
