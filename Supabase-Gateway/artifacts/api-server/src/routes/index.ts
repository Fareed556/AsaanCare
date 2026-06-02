import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import doctorsRouter from "./doctors";
import patientsRouter from "./patients";
import appointmentsRouter from "./appointments";
import paymentsRouter from "./payments";
import subscriptionsRouter from "./subscriptions";
import supportRouter from "./support";
import auditRouter from "./audit";
import adminUsersRouter from "./adminUsers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(doctorsRouter);
router.use(patientsRouter);
router.use(appointmentsRouter);
router.use(paymentsRouter);
router.use(subscriptionsRouter);
router.use(supportRouter);
router.use(auditRouter);
router.use(adminUsersRouter);

export default router;
