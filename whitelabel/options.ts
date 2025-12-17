import { api } from "encore.dev/api";

export const optionsWhiteLabel = api(
  {
    method: "OPTIONS",
    path: "/api/v1/whitelabel/*",
    auth: false,
  },
  async () => ({})
);
