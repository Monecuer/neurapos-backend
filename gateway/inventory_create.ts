import * as inventory from "../inventory/create";

// Proxy handler for creating inventory
export async function createInventory(req: any, res: any) {
  const result = await inventory.create(req.body, {});
  res.json(result);
}
