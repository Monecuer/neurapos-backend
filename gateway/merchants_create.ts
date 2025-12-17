import * as merchants from "../merchants/create";

// Proxy handler for creating a merchant
export async function createMerchant(req: any, res: any) {
  const result = await merchants.create(req.body, {});
  res.json(result);
}
