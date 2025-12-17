import { api } from "encore.dev/api";

export const optionsDevices = api(
  {
    method: "OPTIONS",
    path: "/api/v1/devices",
    auth: false,
  },
  async () => ({})
);

export const optionsDevicesRegister = api(
  {
    method: "OPTIONS",
    path: "/api/v1/devices/register",
    auth: false,
  },
  async () => ({})
);

export const optionsDevicesActivationCode = api(
  {
    method: "OPTIONS",
    path: "/api/v1/devices/activation-code",
    auth: false,
  },
  async () => ({})
);
