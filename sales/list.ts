// Internal sales list logic for gateway
export async function list() {
  // TODO: Implement actual sales listing logic or proxy to DB/service
  return [];
}
  createdAt: Date;
}

interface ListSalesResponse {
  sales: Sale[];
  total: number;
}

// Retrieves all sales with optional filtering.
export const list = api<ListSalesRequest, ListSalesResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/sales" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.merchantId) {
      whereClause += ` AND merchant_id = $${paramIndex++}`;
      params.push(req.merchantId);
    }

    if (req.branchId) {
      whereClause += ` AND branch_id = $${paramIndex++}`;
      params.push(req.branchId);
    }

    const countQuery = `SELECT COUNT(*) as count FROM sales ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    const query = `
      SELECT 
        id,
        merchant_id as "merchantId",
        branch_id as "branchId",
        device_id as "deviceId",
        cashier_user_id as "cashierUserId",
        total_amount as "totalAmount",
        payment_type as "paymentType",
        sync_status as "syncStatus",
        created_at as "createdAt"
      FROM sales
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const sales = await db.rawQueryAll<Sale>(query, ...params, limit, offset);

    return { sales, total };
  }
);
