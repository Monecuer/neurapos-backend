import * as branches from "../branches/list";

// Proxy handler for listing branches
export async function listBranches(req: any, res: any) {
  const result = await branches.list();
  res.json(result);
}
