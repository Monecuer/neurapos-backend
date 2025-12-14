import { api, APIError } from "encore.dev/api";
import db from "../db";
import { createAuditLog } from "../audit/create";

interface SyncSaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SyncSale {
  id: string;
  merchantId: string;
  branchId: string;
  deviceId: string;
  cashierUserId: string;
  totalAmount: number;
  paymentType: string;
  localHash: string;
  items: SyncSaleItem[];
  createdAt: Date;
}

interface SyncSalesRequest {
  deviceId: string;
  sales: SyncSale[];
}

interface SyncResult {
  saleId: string;
  status: string;
  serverId?: string;
  error?: string;
}

interface SyncSalesResponse {
  results: SyncResult[];
  successCount: number;
  errorCount: number;
  conflictsCount: number;
}

// Syncs sales from a device to the server.
export const syncSales = api<SyncSalesRequest, SyncSalesResponse>(
  { expose: true, method: "POST", path: "/api/v1/sync/sales" },
  async (req) => {
    const device = await db.queryRow<{
      id: string;
      merchantId: string;
      status: string;
    }>`
      SELECT 
        id,
        merchant_id as "merchantId",
        status
      FROM devices
      WHERE id = ${req.deviceId}
    `;

    if (!device || device.status !== "active") {
      throw APIError.permissionDenied("device not authorized");
    }

    const results: SyncResult[] = [];
    let successCount = 0;
    let errorCount = 0;
    let conflictsCount = 0;

    for (const sale of req.sales) {
      try {
        const existing = await db.queryRow<{ id: string }>`
          SELECT id FROM sales WHERE id = ${sale.id}
        `;

        if (existing) {
          results.push({
            saleId: sale.id,
            status: "duplicate",
            error: "Sale already synced",
          });
          errorCount++;
          continue;
        }

        await db.exec`
          INSERT INTO sales (
            id, merchant_id, branch_id, device_id, cashier_user_id,
            total_amount, payment_type, sync_status, local_hash, server_synced_at, created_at
          )
          VALUES (
            ${sale.id}, ${sale.merchantId}, ${sale.branchId}, ${sale.deviceId},
            ${sale.cashierUserId}, ${sale.totalAmount}, ${sale.paymentType},
            'synced', ${sale.localHash}, NOW(), ${sale.createdAt}
          )
        `;

        for (const item of sale.items) {
          const itemId = `SI-${Date.now()}-${Math.random().toString(36).substring(7)}`;

          await db.exec`
            INSERT INTO sale_items (
              id, sale_id, product_id, product_name, quantity, unit_price, total_price
            )
            VALUES (
              ${itemId}, ${sale.id}, ${item.productId}, ${item.productName},
              ${item.quantity}, ${item.unitPrice}, ${item.totalPrice}
            )
          `;

          await db.exec`
            UPDATE inventory
            SET quantity = quantity - ${item.quantity},
                updated_at = NOW()
            WHERE id = ${item.productId}
              AND merchant_id = ${sale.merchantId}
              AND branch_id = ${sale.branchId}
          `;

          const movementId = `SM-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          await db.exec`
            INSERT INTO stock_movements (
              id, merchant_id, branch_id, product_id, movement_type,
              quantity, reference_id, reference_type
            )
            VALUES (
              ${movementId}, ${sale.merchantId}, ${sale.branchId}, ${item.productId},
              'sale', ${-item.quantity}, ${sale.id}, 'sale'
            )
          `;
        }

        results.push({
          saleId: sale.id,
          status: "success",
          serverId: sale.id,
        });
        successCount++;
      } catch (error) {
        results.push({
          saleId: sale.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        errorCount++;
      }
    }

    const logId = `SL-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await db.exec`
      INSERT INTO sync_logs (
        id, device_id, sync_type, batch_size, success_count,
        error_count, conflicts_count, sync_data
      )
      VALUES (
        ${logId}, ${req.deviceId}, 'sales', ${req.sales.length},
        ${successCount}, ${errorCount}, ${conflictsCount},
        ${JSON.stringify({ results })}
      )
    `;

    await createAuditLog({
      action: "sales_synced",
      targetType: "device",
      targetId: req.deviceId,
      metadata: { successCount, errorCount, conflictsCount },
    });

    return {
      results,
      successCount,
      errorCount,
      conflictsCount,
    };
  }
);
