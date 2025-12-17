import { api } from "encore.dev/api";

export const optionsWhiteLabel = api(
  {
    method: "OPTIONS",
    path: "/api/v1/admin/white-label",
    auth: false,
  },
  async () => ({})
);
