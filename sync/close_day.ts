import { api } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";
import { createNotification } from "../notifications/create";

interface CloseDayRequest {
  deviceId: string;
  closedBy: string;
  salesCount: number;
  totalAmount: number;
  closingNotes?: string;
}

interface CloseDayResponse {
  closingId: string;
  syncedSalesCount: number;
  totalRevenue: number;
  timestamp: Date;
}

export const closeDay = api<CloseDayRequest, CloseDayResponse>(
  { auth: true, expose: true, method: "POST", path: "/api/v1/sync/close-day" },
  async (req) => {
    const closingId = `CLOSE-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const device = await db.queryRow<{
      id: string;
      merchantId: string;
      branchId: string;
    }>`
      SELECT 
        id,
        merchant_id as "merchantId",
        branch_id as "branchId"
      FROM devices
      WHERE id = ${req.deviceId}
    `;

    if (!device) {
      throw new Error("Device not found");
    }

    await db.exec`
      INSERT INTO day_closings (
        id, device_id, merchant_id, branch_id, closed_by, sales_count,
        total_amount, closing_notes, closed_at
      )
      VALUES (
        ${closingId}, ${req.deviceId}, ${device.merchantId}, ${device.branchId},
        ${req.closedBy}, ${req.salesCount}, ${req.totalAmount},
        ${req.closingNotes || null}, NOW()
      )
    `;

    await createAuditLog({
      action: "day_closed",
      targetType: "device",
      targetId: req.deviceId,
      metadata: {
        closingId,
        salesCount: req.salesCount,
        totalAmount: req.totalAmount,
      },
    });

    await createNotification({
      recipientType: "merchant",
      recipientId: device.merchantId,
      severity: "info",
      title: "Day Closed",
      message: `Device ${req.deviceId} closed with ${req.salesCount} sales totaling $${req.totalAmount.toFixed(2)}`,
    });

    return {
      closingId,
      syncedSalesCount: req.salesCount,
      totalRevenue: req.totalAmount,
      timestamp: new Date(),
    };
  }
);
