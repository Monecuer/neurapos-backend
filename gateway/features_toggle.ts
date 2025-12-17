import { api } from "encore.dev/api";
import * as features from "../features";

export const toggleFeature = api(
  { method: "POST", path: "/api/v1/features/toggle" },
  async (req, ctx) => features.toggle(req, ctx)
);
// Add more feature endpoints as needed
