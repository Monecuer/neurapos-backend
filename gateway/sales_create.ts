import * as sales from "../sales/create";

// Proxy handler for creating a sale
export async function createSale(req: any, res: any) {
  const result = await sales.create(req.body, {});
  res.json(result);
}
