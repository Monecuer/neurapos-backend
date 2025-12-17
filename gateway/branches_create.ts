import { api } from "encore.dev/api";
import * as branches from "../branches";

export const createBranch = api(
  { method: "POST", path: "/api/v1/branches" },
  async (req, ctx) => branches.create(req, ctx)
);
// Add more branch endpoints as needed
