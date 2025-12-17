import { api } from "encore.dev/api";
import * as inventory from "../inventory";

export const listInventory = api(
  { method: "GET", path: "/api/v1/inventory" },
  async () => inventory.list()
);
// Add more inventory endpoints as needed
