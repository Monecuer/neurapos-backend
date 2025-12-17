import { api } from "encore.dev/api";
import * as merchants from "../merchants";

export const createMerchant = api(
  { method: "POST", path: "/api/v1/merchants" },
  async (req, ctx) => merchants.create(req, ctx)
);
// Add more merchant endpoints as needed
