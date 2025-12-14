import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListBranchesRequest {
  merchantId?: Query<string>;
}

interface Branch {
  id: string;
  merchantId: string;
  name: string;
  address: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ListBranchesResponse {
  branches: Branch[];
}

// Retrieves all branches, optionally filtered by merchant.
export const list = api<ListBranchesRequest, ListBranchesResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/branches" },
  async (req) => {
    let query = `
      SELECT 
        id,
        merchant_id as "merchantId",
        name,
        address,
        timezone,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM branches
    `;

    const params: any[] = [];
    if (req.merchantId) {
      query += " WHERE merchant_id = $1";
      params.push(req.merchantId);
    }

    query += " ORDER BY created_at DESC";

    const branches = await db.rawQueryAll<Branch>(query, ...params);

    return { branches };
  }
);
