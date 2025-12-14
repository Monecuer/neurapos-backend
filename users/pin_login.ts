import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import jwt from "jsonwebtoken";

import db from "../db";
import { createAuditLog } from "../audit/create";

const jwtSecret = secret("JWTSecret");

interface PinLoginRequest {
  email: string;
  pin: string;
  deviceId: string;
}

interface PinLoginResponse {
  sessionToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

// Authenticates a user with email and PIN.
export const pinLogin = api<PinLoginRequest, PinLoginResponse>(
  { expose: true, method: "POST", path: "/api/v1/auth/pin-login" },
  async (req) => {
    const user = await db.queryRow<{
      id: string;
      email: string;
      fullName: string;
      role: string;
      pinHash: string;
      isActive: boolean;
      failedLoginAttempts: number;
      lockedUntil: Date | null;
    }>`
      SELECT 
        id,
        email,
        full_name as "fullName",
        role,
        pin_hash as "pinHash",
        is_active as "isActive",
        failed_login_attempts as "failedLoginAttempts",
        locked_until as "lockedUntil"
      FROM users
      WHERE email = ${req.email}
    `;

    if (!user) {
      throw APIError.unauthenticated("invalid credentials");
    }

    if (!user.isActive) {
      throw APIError.permissionDenied("user account is inactive");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw APIError.permissionDenied("account is locked");
    }

    const pinMatch = await db.queryRow<{ match: boolean }>`
      SELECT (${user.pinHash} = crypt(${req.pin}, ${user.pinHash})) as match
    `;

    if (!pinMatch || !pinMatch.match) {
      const newAttempts = user.failedLoginAttempts + 1;
      const lockUntil =
        newAttempts >= 3
          ? new Date(Date.now() + 30 * 60 * 1000)
          : null;

      await db.exec`
        UPDATE users
        SET failed_login_attempts = ${newAttempts},
            locked_until = ${lockUntil}
        WHERE id = ${user.id}
      `;

      await createAuditLog({
        action: "auth_login_failure",
        targetType: "user",
        targetId: user.id,
        metadata: { deviceId: req.deviceId, attempts: newAttempts },
      });

      throw APIError.unauthenticated("invalid credentials");
    }

    await db.exec`
      UPDATE users
      SET failed_login_attempts = 0,
          locked_until = NULL
      WHERE id = ${user.id}
    `;

    // ✅ CORRECT JWT SIGNING (ESM-SAFE)
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        deviceId: req.deviceId,
      },
      jwtSecret(),
      { expiresIn: "8h" }
    );

    await createAuditLog({
      action: "auth_login_success",
      targetType: "user",
      targetId: user.id,
      metadata: { deviceId: req.deviceId },
    });

    return {
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
);
