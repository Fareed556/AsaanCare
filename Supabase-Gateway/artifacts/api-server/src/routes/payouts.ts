import { Router } from "express";
import { eq, and, desc, ilike } from "drizzle-orm";
import { db, doctorPayoutsTable } from "../lib/db";
import { requireAuth, requireRole, FINANCE_AND_ABOVE } from "../middlewares/auth";
import { paginate, parsePagination } from "../lib/pagination";
import { writeAudit } from "../lib/audit";

const router = Router();
router.use(requireAuth);

router.get("/payouts", async (req, res): Promise<void> => {
  const q = req.query as Record<string, string>;
  const conds: any[] = [];
  if (q.status && q.status !== "all") conds.push(eq(doctorPayoutsTable.status, q.status as any));
  if (q.doctorId) conds.push(eq(doctorPayoutsTable.doctorId, q.doctorId));
  if (q.search) conds.push(ilike(doctorPayoutsTable.doctorName, `%${q.search}%`));
  const all = conds.length
    ? await db.select().from(doctorPayoutsTable).where(and(...conds)).orderBy(desc(doctorPayoutsTable.requestedAt))
    : await db.select().from(doctorPayoutsTable).orderBy(desc(doctorPayoutsTable.requestedAt));
  const result = paginate(all, parsePagination(q));
  res.json(result);
});

router.get("/payouts/stats", async (_req, res) => {
  const all = await db.select({ status: doctorPayoutsTable.status, amount: doctorPayoutsTable.amount }).from(doctorPayoutsTable);
  const sum = (filter: (p: typeof all[0]) => boolean) =>
    all.filter(filter).reduce((s, p) => s + parseFloat(p.amount ?? "0"), 0);
  res.json({
    pending: all.filter(p => p.status === "PENDING").length,
    approved: all.filter(p => p.status === "APPROVED").length,
    paid: all.filter(p => p.status === "PAID").length,
    rejected: all.filter(p => p.status === "REJECTED").length,
    total_pending_amount: sum(p => p.status === "PENDING" || p.status === "APPROVED"),
  });
});

router.get("/payouts/:id", async (req, res): Promise<void> => {
  const payout = await db.select().from(doctorPayoutsTable).where(eq(doctorPayoutsTable.id, (req.params.id as string))).limit(1);
  if (!payout.length) { res.status(404).json({ error: "Payout not found" }); return; }
  res.json(payout[0]);
});

router.patch("/payouts/:id", requireRole(...FINANCE_AND_ABOVE), async (req, res): Promise<void> => {
  const { status, adminNotes } = req.body;
  const existing = await db.select().from(doctorPayoutsTable).where(eq(doctorPayoutsTable.id, (req.params.id as string))).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Payout not found" }); return; }
  const update: any = { status, adminNotes: adminNotes ?? existing[0].adminNotes, processedByAdminId: req.admin!.adminId, updatedAt: new Date() };
  if (status === "PAID") update.processedAt = new Date();
  await db.update(doctorPayoutsTable).set(update).where(eq(doctorPayoutsTable.id, (req.params.id as string)));
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "PAYOUT_STATUS_CHANGED", entityType: "DoctorPayout", entityId: (req.params.id as string), oldValue: { status: existing[0].status }, newValue: { status } });
  const updated = await db.select().from(doctorPayoutsTable).where(eq(doctorPayoutsTable.id, (req.params.id as string))).limit(1);
  res.json(updated[0]);
});

export default router;
