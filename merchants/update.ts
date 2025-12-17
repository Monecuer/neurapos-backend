// Internal merchants update logic for gateway
export async function update(req: any, ctx: any) {
  // TODO: Implement actual merchant update logic
  return { success: true };
}
      UPDATE merchants 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        name,
        plan_id as "planId",
        status,
        contact_email as "contactEmail",
        contact_phone as "contactPhone",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    params.push(req.id);
    const merchant = await db.rawQueryRow<Merchant>(query, ...params);

    if (!merchant) {
      throw APIError.notFound("merchant not found");
    }

    await createAuditLog({
      action: "merchant_updated",
      targetType: "merchant",
      targetId: req.id,
      metadata: req,
    });

    return merchant;
  }
);
