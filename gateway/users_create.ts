import { api } from "encore.dev/api";
import * as users from "../users";

export const createUser = api(
  { method: "POST", path: "/api/v1/users" },
  async (req, ctx) => users.create(req, ctx)
);
// Add more user endpoints as needed
