import * as merchants from "../merchants/list";

// Proxy handler for listing merchants
export async function listMerchants(req: any, res: any) {
  const result = await merchants.list();
  res.json(result);
}
