import * as subscriptions from "../subscriptions/list";

// Proxy handler for listing subscriptions
export async function listSubscriptions(req: any, res: any) {
  const result = await subscriptions.list();
  res.json(result);
}
