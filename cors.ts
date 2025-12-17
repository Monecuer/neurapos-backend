import { api } from "encore.dev/api";

export const cors = api.middleware({
  async before() {
    return {
      headers: {
        "Access-Control-Allow-Origin": "https://neurapos.monecuer.com",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Authorization,Content-Type",
      },
    };
  },
});
