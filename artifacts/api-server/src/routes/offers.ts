import { Router, type IRouter } from "express";
import { db, offersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/offers", async (req, res): Promise<void> => {
  const offers = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.active, true))
    .orderBy(offersTable.id);

  res.json(
    offers.map((o) => ({
      ...o,
      badgeText: o.badgeText ?? null,
      imageUrl: o.imageUrl ?? null,
    }))
  );
});

export default router;
