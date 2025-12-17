import { api } from "encore.dev/api";

export const corsTransport = api.middleware({
  async before() {
    return {
      headers: {
        "Access-Control-Allow-Origin": "https://neurapos.monecuer.com",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Authorization,Content-Type",
        "Access-Control-Allow-Credentials": "true",
      },
    };
  },

  async after(_, res) {
    res.headers = {
      ...res.headers,
      "Access-Control-Allow-Origin": "https://neurapos.monecuer.com",
      "Access-Control-Allow-Credentials": "true",
    };
    return res;
  },
});
