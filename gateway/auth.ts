import * as auth from "../auth/pin_login";

// Proxy handler for PIN login
export async function pinLogin(req: any, res: any) {
  const result = await auth.pin_login(req.body, {});
  res.json(result);
}
