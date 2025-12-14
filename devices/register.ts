import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import jwt from "jsonwebtoken";

import db from "../db";
import { createAuditLog } from "../audit/create";

const jwtSecret = secret("JWTSecret");

interface RegisterDeviceRequest {
  merchantId: string;
  branchId: string;
  deviceFingerprint: string;
  deviceName: string;
  deviceMeta?: Record<string, any>;
  activationCode: string;
}

interface RegisterDeviceResponse {
  deviceId: string;
  licenseToken: string;
  expiresAt: Date;
  initialData: {
    merchant: any;
    branch: any;
    inventory: any[];
    users: any[];
  };
}

// Registers a new device to a merchant and branch.
export const register = api<RegisterDeviceRequest, RegisterDeviceResponse>(
  { expose: true, method: "POST", path: "/api/v1/devices/register" },
  async (req) => {
    const activationCode = await db.queryRow<{
      id: string;
      merchantId: string;
      branchId: string;
      isUsed: boolean;
    }>`
      SELECT 
        id,
        merchant_id as "merchantId",
        branch_id as "branchId",
        is_used as "isUsed"
      FROM activation_codes
      WHERE code = ${req.activationCode}
        AND expires_at > NOW()
    `;

    if (!activationCode) {
      throw APIError.notFound("activation code not found or expired");
    }

    if (activationCode.isUsed) {
      throw APIError.alreadyExists("activation code already used");
    }

    if (
      activationCode.merchantId !== req.merchantId ||
      activationCode.branchId !== req.branchId
    ) {
      throw APIError.invalidArgument("activation code mismatch");
    }

    const merchant = await db.queryRow<{ status: string }>`
      SELECT status FROM merchants WHERE id = ${req.merchantId}
    `;

    if (!merchant || merchant.status === "suspended") {
      throw APIError.permissionDenied("merchant not active");
    }

    const existingDevice = await db.queryRow<{ id: string }>`
      SELECT id FROM devices WHERE device_fingerprint = ${req.deviceFingerprint}
    `;

    if (existingDevice) {
      throw APIError.alreadyExists("device already registered");
    }

    const deviceId = `D-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // ✅ CORRECT JWT SIGNING (ESM-SAFE)
    const licenseToken = jwt.sign(
      {
        deviceId,
        merchantId: req.merchantId,
        branchId: req.branchId,
        expiresAt: expiresAt.toISOString(),
      },
      jwtSecret(),
      { expiresIn: "7d" }
    );

    await db.exec`
      INSERT INTO devices (
        id,
        merchant_id,
        branch_id,
        device_fingerprint,
        device_name,
        device_meta,
        license_token,
        license_expires_at,
        status,
        last_seen
      )
      VALUES (
        ${deviceId},
        ${req.merchantId},
        ${req.branchId},
        ${req.deviceFingerprint},
        ${req.deviceName},
        ${JSON.stringify(req.deviceMeta ?? {})},
        ${licenseToken},
        ${expiresAt},
        'active',
        NOW()
      )
    `;

    await db.exec`
      UPDATE activation_codes
      SET is_used = true,
          used_by_device_id = ${deviceId}
      WHERE id = ${activationCode.id}
    `;

    const merchantData = await db.queryRow`
      SELECT id, name, plan_id, status
      FROM merchants
      WHERE id = ${req.merchantId}
    `;

    const branchData = await db.queryRow`
      SELECT id, name, timezone
      FROM branches
      WHERE id = ${req.branchId}
    `;

    const inventory = await db.queryAll`
      SELECT 
        id,
        product_name as "productName",
        sku,
        category,
        unit_price as "unitPrice",
        quantity,
        allow_negative as "allowNegative"
      FROM inventory
      WHERE merchant_id = ${req.merchantId}
        AND branch_id = ${req.branchId}
        AND is_active = true
    `;

    const users = await db.queryAll`
      SELECT 
        id,
        email,
        full_name as "fullName",
        role,
        pin_hash as "pinHash",
        is_active as "isActive"
      FROM users
      WHERE merchant_id = ${req.merchantId}
        AND is_active = true
    `;

    await createAuditLog({
      action: "device_registered",
      targetType: "device",
      targetId: deviceId,
      metadata: {
        merchantId: req.merchantId,
        branchId: req.branchId,
        deviceName: req.deviceName,
      },
    });

    return {
      deviceId,
      licenseToken,
      expiresAt,
      initialData: {
        merchant: merchantData,
        branch: branchData,
        inventory,
        users,
      },
    };
  }
);
