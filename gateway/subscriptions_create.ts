import { api } from "encore.dev/api";
import * as subscriptions from "../subscriptions";

export const createSubscription = api(
  { method: "POST", path: "/api/v1/subscriptions" },
  async (req, ctx) => subscriptions.create(req, ctx)
);
// Add more subscription endpoints as needed
