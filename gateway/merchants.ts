import { api } from "encore.dev/api";
import * as merchants from "../merchants";

export const listMerchants = api(
  { method: "GET", path: "/api/v1/merchants" },
  async () => merchants.list()
);
// Add more merchants endpoints as needed
