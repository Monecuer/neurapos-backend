

import { api } from "encore.dev/api";
import { Service } from "encore.dev/service";
import { cors } from "../cors";

export default new Service("frontend", {
  middlewares: [cors],
});

export const assets = api.static({
  path: "/frontend/*path",
  expose: true,
  dir: "./dist",
  notFound: "./dist/index.html",
  notFoundStatus: 200,
});
