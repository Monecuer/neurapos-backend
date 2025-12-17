import { api } from "encore.dev/api";
import * as notifications from "../notifications";

export const listNotifications = api(
  { method: "GET", path: "/api/v1/notifications" },
  async () => notifications.list()
);
// Add more notifications endpoints as needed
