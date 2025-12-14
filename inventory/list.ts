import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListInventoryRequest {
  merchantId?: Query<string>;
  branchId?: Query<string>;
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

interface ListInventoryResponse {
  items: InventoryItem[];
}

// Retrieves all inventory items with optional filtering.
export const list = api<ListInventoryRequest, ListInventoryResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/inventory" },
  async (req) => {
    let query = `
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
      WHERE is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (req.merchantId) {
      query += ` AND merchant_id = $${paramIndex++}`;
      params.push(req.merchantId);
    }

    if (req.branchId) {
      query += ` AND branch_id = $${paramIndex++}`;
      params.push(req.branchId);
    }

    query += " ORDER BY product_name ASC";

    const items = await db.rawQueryAll<InventoryItem>(query, ...params);

    return { items };
  }
);
