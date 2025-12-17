import { api } from "encore.dev/api";
import * as audit from "../audit";

export const listAuditLogs = api(
  { method: "GET", path: "/api/v1/audit" },
  async () => audit.list()
);
// Add more audit endpoints as needed
