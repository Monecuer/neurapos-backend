import { api } from "encore.dev/api";

export const optionsSubscriptions = api(
  {
    method: "OPTIONS",
    path: "/api/v1/subscriptions",
    auth: false,
  },
  async () => ({})
);


