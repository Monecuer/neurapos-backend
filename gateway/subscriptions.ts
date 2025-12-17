import { api } from "encore.dev/api";
import * as subscriptions from "../subscriptions";

export const listSubscriptions = api(
  { method: "GET", path: "/api/v1/subscriptions" },
  async () => subscriptions.list()
);
// Add more subscriptions endpoints as needed
