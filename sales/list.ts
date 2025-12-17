// Internal sales list logic for gateway
export async function list() {
  // TODO: Implement actual sales listing logic or proxy to DB/service
  return [];
}
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
