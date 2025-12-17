import { api } from "encore.dev/api";
import * as features from "../features";

export const listFeatures = api(
  { method: "GET", path: "/api/v1/features" },
  async () => features.list()
);
// Add more features endpoints as needed
