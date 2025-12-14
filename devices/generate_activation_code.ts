import { api } from "encore.dev/api";
import db from "../db";

interface GenerateActivationCodeRequest {
  merchantId: string;
  branchId: string;
  deviceName: string;
}

interface ActivationCode {
  id: string;
  code: string;
  deviceName: string;
  expiresAt: Date;
}

// Generates an activation code for device registration.
export const generateActivationCode = api<
  GenerateActivationCodeRequest,
  ActivationCode
>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/devices/activation-code" },
  async (req) => {
    const id = `AC-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const code = `${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.exec`
      INSERT INTO activation_codes (id, merchant_id, branch_id, code, device_name, expires_at)
      VALUES (${id}, ${req.merchantId}, ${req.branchId}, ${code}, ${req.deviceName}, ${expiresAt})
    `;

    return {
      id,
      code,
      deviceName: req.deviceName,
      expiresAt,
    };
  }
);
