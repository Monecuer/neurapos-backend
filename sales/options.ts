import { api } from "encore.dev/api";

export const optionsSales = api(
  {
    method: "OPTIONS",
    path: "/api/v1/sales",
    auth: false,
  },
  async () => ({})
);
