import { api } from "encore.dev/api";


export const optionsAudit = api(
  {
    method: "OPTIONS",
    path: "/api/v1/admin/audit",
    auth: false,
  },
  async () => ({})
);
