import { App } from "encore.dev";

export default new App({
  cors: {
    allowOrigins: [
      "https://neurapos.monecuer.com",
      "https://www.neurapos.monecuer.com",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Authorization",
      "Content-Type",
      "X-Requested-With",
    ],
    allowCredentials: true,
  },
});
