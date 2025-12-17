import { api } from "encore.dev/api";
import * as sync from "../sync";

export const syncSales = api(
  { method: "POST", path: "/api/v1/sync/sales" },
  async (req, ctx) => sync.sales(req, ctx)
);
// Add more sync endpoints as needed
