import { api } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";

interface CreateInventoryRequest {
  merchantId: string;
  branchId: string;
  productName: string;
  sku?: string;
  category?: string;
  unitPrice: number;
  quantity?: number;
  allowNegative?: boolean;
}

interface InventoryItem {
  id: string;
  merchantId: string;
  branchId: string;
  productName: string;
  sku: string | null;
  category: string | null;
  unitPrice: number;
  quantity: number;
  allowNegative: boolean;
  isActive: boolean;
  createdAt: Date;
}

// Creates a new inventory item.
export const create = api<CreateInventoryRequest, InventoryItem>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/inventory" },
  async (req) => {
    const id = `INV-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.exec`
      INSERT INTO inventory (
        id, merchant_id, branch_id, product_name, sku, category,
        unit_price, quantity, allow_negative
      )
      VALUES (
        ${id}, ${req.merchantId}, ${req.branchId}, ${req.productName},
        ${req.sku || null}, ${req.category || null}, ${req.unitPrice},
        ${req.quantity || 0}, ${req.allowNegative || false}
      )
    `;

    const item = await db.queryRow<InventoryItem>`
      SELECT 
        id,
        merchant_id as "merchantId",
        branch_id as "branchId",
        product_name as "productName",
        sku,
        category,
        unit_price as "unitPrice",
        quantity,
        allow_negative as "allowNegative",
        is_active as "isActive",
        created_at as "createdAt"
      FROM inventory
      WHERE id = ${id}
    `;

    if (!item) {
      throw new Error("Failed to create inventory item");
    }

    await createAuditLog({
      action: "inventory_created",
      targetType: "inventory",
      targetId: id,
      metadata: { productName: req.productName, quantity: req.quantity || 0 },
    });

    return item;
  }
);
