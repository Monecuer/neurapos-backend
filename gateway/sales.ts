import * as sales from "../sales/list";

// Proxy handler for listing sales
export async function listSales(req: any, res: any) {
  const result = await sales.list();
  res.json(result);
}
