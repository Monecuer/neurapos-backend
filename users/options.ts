export const optionsUsers = api(
  {
    method: "OPTIONS",
    path: "/api/v1/users/*",
    auth: false,
  },
  async () => ({})
);
