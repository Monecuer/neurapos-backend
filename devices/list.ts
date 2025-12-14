import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListDevicesRequest {
  merchantId?: Query<string>;
  branchId?: Query<string>;
}

interface Device {
  id: string;
  merchantId: string;
  branchId: string;
  deviceFingerprint: string;
  deviceName: string;
  status: string;
  lastSeen: Date | null;
  createdAt: Date;
}

interface ListDevicesResponse {
  devices: Device[];
}

// Retrieves all devices with optional filtering.
export const list = api<ListDevicesRequest, ListDevicesResponse>(
  { auth: true, expose: true, method: "GET", path: "/api/v1/devices" },
  async (req) => {
    let query = `
      SELECT 
        id,
        merchant_id as "merchantId",
        branch_id as "branchId",
        device_fingerprint as "deviceFingerprint",
        device_name as "deviceName",
        status,
        last_seen as "lastSeen",
        created_at as "createdAt"
      FROM devices
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (req.merchantId) {
      query += ` AND merchant_id = $${paramIndex++}`;
      params.push(req.merchantId);
    }

    if (req.branchId) {
      query += ` AND branch_id = $${paramIndex++}`;
      params.push(req.branchId);
    }

    query += " ORDER BY created_at DESC";

    const devices = await db.rawQueryAll<Device>(query, ...params);

    return { devices };
  }
);
