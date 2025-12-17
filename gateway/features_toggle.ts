import * as features from "../features/toggle";

// Proxy handler for toggling a feature
export async function toggleFeature(req: any, res: any) {
  const result = await features.toggle(req.body, {});
  res.json(result);
}
