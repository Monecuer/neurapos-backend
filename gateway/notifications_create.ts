import { api } from "encore.dev/api";
import * as notifications from "../notifications";

export const createNotification = api(
  { method: "POST", path: "/api/v1/notifications" },
  async (req, ctx) => notifications.create(req, ctx)
);
// Add more notification endpoints as needed
