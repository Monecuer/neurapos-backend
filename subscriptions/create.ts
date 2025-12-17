// Internal subscriptions create logic for gateway
export async function create(req: any, ctx: any) {
  // TODO: Implement actual subscription creation logic
  return { success: true };
}
    `;

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    await createAuditLog({
      action: "subscription_created",
      targetType: "subscription",
      targetId: id,
      metadata: { merchantId: req.merchantId, plan: req.plan },
    });

    return subscription;
  }
);
