import { api } from "encore.dev/api";

export const optionsNotifications = api(
  {
    method: "OPTIONS",
    path: "/api/v1/notifications",
    auth: false,
  },
  async () => ({})
);
