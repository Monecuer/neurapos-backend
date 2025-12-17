
// Internal users list logic for gateway
export async function list() {
  // TODO: Implement actual user listing logic or proxy to DB/service
  return [];
}

interface ListUsersResponse {
  users: User[];
}

// Retrieves all users with optional filtering.
export const list = api<ListUsersRequest, ListUsersResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/users" },
  async (req) => {
    let query = `
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
      WHERE 1=1
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

    query += " ORDER BY created_at DESC";

    const users = await db.rawQueryAll<User>(query, ...params);

    return { users };
  }
);
