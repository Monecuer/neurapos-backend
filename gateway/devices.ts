import * as devices from "../devices/list";

// Proxy handler for listing devices
export async function listDevices(req: any, res: any) {
  const result = await devices.list();
  res.json(result);
}
