import { api } from "encore.dev/api";
import * as inventory from "../inventory";

export const createInventory = api(
  { method: "POST", path: "/api/v1/inventory" },
  async (req, ctx) => inventory.create(req, ctx)
);
// Add more inventory endpoints as needed
