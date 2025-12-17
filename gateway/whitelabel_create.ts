import * as whitelabel from "../whitelabel/create";

// Proxy handler for creating a white-label partner
export async function createWhiteLabel(req: any, res: any) {
  const result = await whitelabel.create(req.body, {});
  res.json(result);
}
