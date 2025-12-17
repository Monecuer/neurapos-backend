import * as notifications from "../notifications/create";

// Proxy handler for creating a notification
export async function createNotification(req: any, res: any) {
  const result = await notifications.create(req.body, {});
  res.json(result);
}
