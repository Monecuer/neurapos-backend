import { api } from "encore.dev/api";

export const optionsFeatures = api(
  {
    method: "OPTIONS",
    path: "/api/v1/admin/feature-flags",
    auth: false,
  },
  async () => ({})
);
