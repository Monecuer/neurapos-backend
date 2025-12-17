import * as inventory from "../inventory/list";

// Proxy handler for listing inventory
export async function listInventory(req: any, res: any) {
  const result = await inventory.list();
  res.json(result);
}
