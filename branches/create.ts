import { api } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";

interface CreateBranchRequest {
  merchantId: string;
  name: string;
  address?: string;
  timezone?: string;
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

// Creates a new branch for a merchant.
export const create = api<CreateBranchRequest, Branch>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/branches" },
  async (req) => {
    const id = `B-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.exec`
      INSERT INTO branches (id, merchant_id, name, address, timezone)
      VALUES (${id}, ${req.merchantId}, ${req.name}, ${req.address || null}, ${req.timezone || "UTC"})
    `;

    const branch = await db.queryRow<Branch>`
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
      WHERE id = ${id}
    `;

    if (!branch) {
      throw new Error("Failed to create branch");
    }

    await createAuditLog({
      action: "branch_created",
      targetType: "branch",
      targetId: id,
      metadata: { merchantId: req.merchantId, name: req.name },
    });

    return branch;
  }
);
