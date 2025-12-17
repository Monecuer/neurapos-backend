import { api } from "encore.dev/api";
import * as sales from "../sales";

export const createSale = api(
  { method: "POST", path: "/api/v1/sales" },
  async (req, ctx) => sales.create(req, ctx)
);
// Add more sales endpoints as needed
