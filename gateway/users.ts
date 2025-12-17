import * as users from "../users/list";

// Proxy handler for listing users
export async function listUsers(req: any, res: any) {
  const result = await users.list();
  res.json(result);
}
