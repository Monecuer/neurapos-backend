import { api } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";

interface CreateUserRequest {
  merchantId: string;
  branchId?: string;
  email: string;
  fullName: string;
  role: string;
  pin: string;
}

interface User {
  id: string;
  merchantId: string;
  branchId: string | null;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

// Creates a new user with PIN authentication.
export const create = api<CreateUserRequest, User>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/users" },
  async (req) => {
    const id = `U-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const pinHash = await db.queryRow<{ hash: string }>`
      SELECT crypt(${req.pin}, gen_salt('bf')) as hash
    `;

    if (!pinHash) {
      throw new Error("Failed to hash PIN");
    }

    await db.exec`
      INSERT INTO users (
        id, merchant_id, branch_id, email, full_name, role, pin_hash
      )
      VALUES (
        ${id}, ${req.merchantId}, ${req.branchId || null}, ${req.email},
        ${req.fullName}, ${req.role}, ${pinHash.hash}
      )
    `;

    const user = await db.queryRow<User>`
      SELECT 
        id,
        merchant_id as "merchantId",
        branch_id as "branchId",
        email,
        full_name as "fullName",
        role,
        is_active as "isActive",
        created_at as "createdAt"
      FROM users
      WHERE id = ${id}
    `;

    if (!user) {
      throw new Error("Failed to create user");
    }

    await createAuditLog({
      action: "user_created",
      targetType: "user",
      targetId: id,
      metadata: { email: req.email, role: req.role },
    });

    return user;
  }
);
