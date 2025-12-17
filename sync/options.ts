

import { api } from "encore.dev/api";

export const optionsSync = api(
  {
    method: "OPTIONS",
    path: "/api/v1/sync/*",
    auth: false,
  },
  async () => ({})
);
