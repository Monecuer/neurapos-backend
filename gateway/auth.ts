import { api } from "encore.dev/api";
import * as auth from "../auth";

export const pinLogin = api(
  { method: "POST", path: "/api/v1/auth/pin-login" },
  async (req, ctx) => auth.pin_login(req, ctx)
);
// Add more auth endpoints as needed
