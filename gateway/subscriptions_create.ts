import * as subscriptions from "../subscriptions/create";

// Proxy handler for creating a subscription
export async function createSubscription(req: any, res: any) {
  const result = await subscriptions.create(req.body, {});
  res.json(result);
}
