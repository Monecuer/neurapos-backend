import * as users from "../users/create";

// Proxy handler for creating a user
export async function createUser(req: any, res: any) {
  const result = await users.create(req.body, {});
  res.json(result);
}
