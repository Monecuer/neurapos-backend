import { api } from "encore.dev/api";

export const optionsMerchants = api(
  {
    method: "OPTIONS",
    path: "/api/v1/merchants/*",
    auth: false,
  },
  async () => ({})
);
