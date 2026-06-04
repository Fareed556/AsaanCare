import { Router } from "express";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { db, refundsTable } from "../lib/db";
import { requireAuth, requireRole, FINANCE_AND_ABOVE } from "../middlewares/auth";
import { paginate, parsePagination } from "../lib/pagination";
import { writeAudit } from "../lib/audit";

const router = Router();
router.use(requireAuth);

router.get("/refunds", async (req, res): Promise<void> => {
  const q = req.query as Record<string, string>;
  const conds: any[] = [];
  if (q.status && q.status !== "all") conds.push(eq(refundsTable.status, q.status as any));
  if (q.search) conds.push(or(ilike(refundsTable.requestedByName, `%${q.search}%`), ilike(refundsTable.reason, `%${q.search}%`)));
  const all = conds.length
    ? await db.select().from(refundsTable).where(and(...conds)).orderBy(desc(refundsTable.createdAt))
    : await db.select().from(refundsTable).orderBy(desc(refundsTable.createdAt));
  const result = paginate(all, parsePagination(q));
  res.json(result);
});

router.get("/refunds/stats", async (_req, res) => {
  const all = await db.select({ status: refundsTable.status }).from(refundsTable);
  res.json({
    total: all.length,
    pending: all.filter(r => r.status === "REQUESTED").length,
    approved: all.filter(r => r.status === "APPROVED").length,
    processed: all.filter(r => r.status === "PROCESSED").length,
    rejected: all.filter(r => r.status === "REJECTED").length,
  });
});

router.get("/refunds/:id", async (req, res): Promise<void> => {
  const refund = await db.select().from(refundsTable).where(eq(refundsTable.id, (req.params.id as string))).limit(1);
  if (!refund.length) { res.status(404).json({ error: "Refund not found" }); return; }
  res.json(refund[0]);
});

router.patch("/refunds/:id", requireRole(...FINANCE_AND_ABOVE), async (req, res): Promise<void> => {
  const { status, adminNotes } = req.body;
  const existing = await db.select().from(refundsTable).where(eq(refundsTable.id, (req.params.id as string))).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Refund not found" }); return; }
  await db.update(refundsTable)
    .set({ status, adminNotes: adminNotes ?? existing[0].adminNotes, reviewedByAdminId: req.admin!.adminId, updatedAt: new Date() })
    .where(eq(refundsTable.id, (req.params.id as string)));
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "REFUND_STATUS_CHANGED", entityType: "Refund", entityId: (req.params.id as string), oldValue: { status: existing[0].status }, newValue: { status } });
  const updated = await db.select().from(refundsTable).where(eq(refundsTable.id, (req.params.id as string))).limit(1);
  res.json(updated[0]);
});

export default router;
