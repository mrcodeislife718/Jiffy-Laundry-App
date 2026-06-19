import { Router, type IRouter } from "express";
import { eq, count, and, sql, isNull, or } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { getAuth } from "@clerk/express";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderParams,
  UpdateOrderBody,
  CancelOrderParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeOrder(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    userId: o.userId ?? null,
    email: o.email ?? null,
    specialInstructions: o.specialInstructions ?? null,
    estimatedPrice: o.estimatedPrice ? parseFloat(o.estimatedPrice) : null,
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const auth = getAuth(req);
  const userId = auth?.userId ?? null;
  const mine = req.query.mine === "true";

  const query = db.select().from(ordersTable).$dynamic();

  if (mine && userId) {
    // user's own orders only
    if (params.data.status) {
      query.where(and(eq(ordersTable.userId, userId), eq(ordersTable.status, params.data.status)));
    } else {
      query.where(eq(ordersTable.userId, userId));
    }
  } else if (params.data.status) {
    query.where(eq(ordersTable.status, params.data.status));
  }

  const orders = await query.orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map(serializeOrder));
});

router.get("/orders/stats", async (req, res): Promise<void> => {
  const allOrders = await db.select({ status: ordersTable.status }).from(ordersTable);

  const today = new Date().toISOString().slice(0, 10);
  const todayPickupsResult = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.scheduledDate, today));

  res.json({
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    inProgress: allOrders.filter((o) =>
      ["confirmed", "picked_up", "in_progress", "ready"].includes(o.status)
    ).length,
    delivered: allOrders.filter((o) => o.status === "delivered").length,
    cancelled: allOrders.filter((o) => o.status === "cancelled").length,
    todayPickups: todayPickupsResult[0]?.count ?? 0,
  });
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const auth = getAuth(req);
  const userId = auth?.userId ?? null;

  const priceMap: Record<string, number> = {
    wash_fold: 15.99,
    dry_cleaning: 24.99,
    ironing: 12.99,
    express: 29.99,
  };

  const estimatedPrice = priceMap[parsed.data.serviceType] ?? 15.99;

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email ?? null,
      address: parsed.data.address,
      serviceType: parsed.data.serviceType,
      scheduledDate: parsed.data.scheduledDate,
      scheduledTime: parsed.data.scheduledTime,
      specialInstructions: parsed.data.specialInstructions ?? null,
      status: "pending",
      estimatedPrice: String(estimatedPrice),
    })
    .returning();

  res.status(201).json(serializeOrder(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.scheduledDate !== undefined) updateData.scheduledDate = parsed.data.scheduledDate;
  if (parsed.data.scheduledTime !== undefined) updateData.scheduledTime = parsed.data.scheduledTime;
  if (parsed.data.specialInstructions !== undefined) updateData.specialInstructions = parsed.data.specialInstructions;
  if (parsed.data.estimatedPrice !== undefined) updateData.estimatedPrice = String(parsed.data.estimatedPrice);

  const [order] = await db
    .update(ordersTable)
    .set(updateData)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

router.delete("/orders/:id", async (req, res): Promise<void> => {
  const params = CancelOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: "cancelled" })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

export default router;
