// Internal subscriptions list logic for gateway
export async function list() {
  // TODO: Implement actual subscriptions listing logic or proxy to DB/service
  return [];
}

interface ListSubscriptionsResponse {
  subscriptions: Subscription[];
}

// Retrieves all subscriptions with optional filtering.
export const list = api<ListSubscriptionsRequest, ListSubscriptionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/subscriptions" },
  async (req) => {
    let query = `
      SELECT 
        s.id,
        s.merchant_id as "merchantId",
        m.name as "merchantName",
        s.plan,
        s.start_date as "startDate",
        s.end_date as "endDate",
        s.status,
        s.grace_days as "graceDays",
        s.enforcement_mode as "enforcementMode",
        s.created_at as "createdAt"
      FROM subscriptions s
      JOIN merchants m ON s.merchant_id = m.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (req.status) {
      query += ` AND s.status = $${paramIndex++}`;
      params.push(req.status);
    }

    query += " ORDER BY s.created_at DESC";

    const subscriptions = await db.rawQueryAll<Subscription>(query, ...params);

    return { subscriptions };
  }
);
