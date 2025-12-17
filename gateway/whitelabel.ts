import { api } from "encore.dev/api";
import * as whitelabel from "../whitelabel";

export const listWhiteLabel = api(
  { method: "GET", path: "/api/v1/whitelabel" },
  async () => whitelabel.list()
);
// Add more whitelabel endpoints as needed
