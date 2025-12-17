

import { api } from "encore.dev/api";

export const optionsDevices = api(
  {
    method: "OPTIONS",
    path: "/api/v1/devices/*",
    auth: false,
  },
  async () => ({})
);
