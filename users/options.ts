import { api } from "encore.dev/api";

export const optionsUsers = api(
  {
    method: "OPTIONS",
    path: "/api/v1/users",
    auth: false,
  },
  async () => ({})
);

export const optionsUsersCreate = api(
  {
    method: "OPTIONS",
    path: "/api/v1/users",
    auth: false,
  },
  async () => ({})
);

export const optionsUsersPinLogin = api(
  {
    method: "OPTIONS",
    path: "/api/v1/auth/pin-login",
    auth: false,
  },
  async () => ({})
);
