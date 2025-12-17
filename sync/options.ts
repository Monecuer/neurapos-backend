import { api } from "encore.dev/api";

export const optionsSyncSales = api(
  {
    method: "OPTIONS",
    path: "/api/v1/sync/sales",
    auth: false,
  },
  async () => ({})
);

export const optionsSyncCloseDay = api(
  {
    method: "OPTIONS",
    path: "/api/v1/sync/close-day",
    auth: false,
  },
  async () => ({})
);
