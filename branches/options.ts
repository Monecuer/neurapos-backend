import { api } from "encore.dev/api";

export const optionsBranches = api(
  {
    method: "OPTIONS",
    path: "/api/v1/branches",
    auth: false,
  },
  async () => ({})
);
