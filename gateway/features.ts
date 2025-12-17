import * as features from "../features/list";

// Proxy handler for listing features
export async function listFeatures(req: any, res: any) {
  const result = await features.list();
  res.json(result);
}
