import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import quotesRouter from "./quotes";
import offersRouter from "./offers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(quotesRouter);
router.use(offersRouter);

export default router;
