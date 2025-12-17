import { api } from "encore.dev/api";
import * as audit from "../audit";

export const createAudit = api(
  { method: "POST", path: "/api/v1/audit" },
  async (req, ctx) => audit.create(req, ctx)
);
// Add more audit endpoints as needed
