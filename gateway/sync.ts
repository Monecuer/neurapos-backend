import * as sync from "../sync/sales";

// Proxy handler for syncing sales
export async function syncSales(req: any, res: any) {
  const result = await sync.sales(req.body, {});
  res.json(result);
}
