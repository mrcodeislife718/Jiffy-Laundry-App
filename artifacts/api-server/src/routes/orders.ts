import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderParams,
  UpdateOrderBody,
  CancelOrderParams,
} from "@workspace/api-zod";
import { resolveServiceOffer } from "../lib/service-catalog.js";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const query = db.select().from(ordersTable).$dynamic();
  if (params.data.status) query.where(eq(ordersTable.status, params.data.status));
  const orders = await query.orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map((o) => ({
    ...o,
    email: o.email ?? null,
    specialInstructions: o.specialInstructions ?? null,
    estimatedPrice: o.estimatedPrice ? parseFloat(o.estimatedPrice) : null,
    createdAt: o.createdAt.toISOString(),
  })));
});

router.get("/orders/stats", async (_req, res): Promise<void> => {
  const allOrders = await db.select({ status: ordersTable.status }).from(ordersTable);
  const today = new Date().toISOString().slice(0, 10);
  const todayPickupsResult = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.scheduledDate, today));
  res.json({
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    inProgress: allOrders.filter((o) => ["confirmed", "picked_up", "in_progress", "ready"].includes(o.status)).length,
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

  let offer;
  try {
    offer = resolveServiceOffer(parsed.data.serviceType);
  } catch (error) {
    const status = Number((error as { statusCode?: unknown })?.statusCode);
    res.status(Number.isInteger(status) ? status : 503).json({ error: error instanceof Error ? error.message : "Service pricing unavailable" });
    return;
  }
  const estimatedPrice = offer.amountCents / 100;

  const [order] = await db.insert(ordersTable).values({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email ?? null,
    address: parsed.data.address,
    serviceType: parsed.data.serviceType,
    scheduledDate: parsed.data.scheduledDate,
    scheduledTime: parsed.data.scheduledTime,
    specialInstructions: parsed.data.specialInstructions ?? null,
    status: "pending",
    estimatedPrice: estimatedPrice.toFixed(2),
  }).returning();

  res.status(201).json({
    ...order,
    email: order.email ?? null,
    specialInstructions: order.specialInstructions ?? null,
    estimatedPrice: order.estimatedPrice ? parseFloat(order.estimatedPrice) : null,
    commercial: { currency: offer.currency, amountCents: offer.amountCents },
    createdAt: order.createdAt.toISOString(),
  });
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({
    ...order,
    email: order.email ?? null,
    specialInstructions: order.specialInstructions ?? null,
    estimatedPrice: order.estimatedPrice ? parseFloat(order.estimatedPrice) : null,
    createdAt: order.createdAt.toISOString(),
  });
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
  const [order] = await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({
    ...order,
    email: order.email ?? null,
    specialInstructions: order.specialInstructions ?? null,
    estimatedPrice: order.estimatedPrice ? parseFloat(order.estimatedPrice) : null,
    createdAt: order.createdAt.toISOString(),
  });
});

router.delete("/orders/:id", async (req, res): Promise<void> => {
  const params = CancelOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db.update(ordersTable).set({ status: "cancelled" }).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({
    ...order,
    email: order.email ?? null,
    specialInstructions: order.specialInstructions ?? null,
    estimatedPrice: order.estimatedPrice ? parseFloat(order.estimatedPrice) : null,
    createdAt: order.createdAt.toISOString(),
  });
});

export default router;
