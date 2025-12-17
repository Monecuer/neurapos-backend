import * as whitelabel from "../whitelabel/list";

// Proxy handler for listing white-label partners
export async function listWhiteLabel(req: any, res: any) {
  const result = await whitelabel.list();
  res.json(result);
}
