import { api } from "encore.dev/api";

export const optionsGateway = api(
  {
    method: "OPTIONS",
    path: "/api/v1/*",
    auth: false,
  },
  async () => ({})
);
