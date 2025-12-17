import { api } from "encore.dev/api";

export const optionsAuditList = api(
  {
    method: "OPTIONS",
    path: "/api/v1/admin/audit",
    auth: false,
  },
  async () => ({})
);

export const optionsAuditCreate = api(
  {
    method: "OPTIONS",
    path: "/api/v1/admin/audit",
    auth: false,
  },
  async () => ({})
);
