import { Router, type IRouter } from "express";
import { CreateQuoteBody } from "@workspace/api-zod";

const router: IRouter = Router();

const PRICING: Record<string, { base: number; perKg: number; label: string }> = {
  wash_fold: { base: 8.99, perKg: 3.5, label: "Wash & Fold" },
  dry_cleaning: { base: 14.99, perKg: 6.0, label: "Dry Cleaning" },
  ironing: { base: 5.99, perKg: 2.5, label: "Ironing" },
  express: { base: 18.99, perKg: 5.0, label: "Express (Same Day)" },
};

router.post("/quotes", async (req, res): Promise<void> => {
  const parsed = CreateQuoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { serviceType, estimatedWeight = 5 } = parsed.data;
  const pricing = PRICING[serviceType] ?? PRICING.wash_fold;
  const deliveryFee = 2.99;
  const servicePrice = parseFloat((pricing.base + pricing.perKg * estimatedWeight).toFixed(2));
  const total = parseFloat((servicePrice + deliveryFee).toFixed(2));

  res.json({
    serviceType,
    estimatedPrice: total,
    currency: "USD",
    breakdown: [
      { label: pricing.label, price: servicePrice },
      { label: "Free Pickup & Delivery", price: deliveryFee },
    ],
    deliveryFee,
    note: "Final price may vary based on actual weight. 24-hour turnaround guaranteed.",
  });
});

export default router;
