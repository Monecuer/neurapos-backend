import * as notifications from "../notifications/list";

// Proxy handler for listing notifications
export async function listNotifications(req: any, res: any) {
  const result = await notifications.list({});
  res.json(result);
}
