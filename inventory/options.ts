import { api } from "encore.dev/api";

export const optionsInventory = api(
  {
    method: "OPTIONS",
    path: "/api/v1/inventory",
    auth: false,
  },
  async () => ({})
);
