import { api } from "encore.dev/api";
import * as whitelabel from "../whitelabel";

export const createWhiteLabel = api(
  { method: "POST", path: "/api/v1/whitelabel" },
  async (req, ctx) => whitelabel.create(req, ctx)
);
// Add more whitelabel endpoints as needed
