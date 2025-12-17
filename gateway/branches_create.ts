import * as branches from "../branches/create";

// Proxy handler for creating a branch
export async function createBranch(req: any, res: any) {
  const result = await branches.create(req.body, {});
  res.json(result);
}
