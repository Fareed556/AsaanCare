import { Router } from "express";
import { eq, ilike, and, or, desc } from "drizzle-orm";
import { db, patientsTable } from "../lib/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { paginate, parsePagination } from "../lib/pagination";
import { writeAudit } from "../lib/audit";

const router = Router();
router.use(requireAuth);

router.get("/patients", async (req, res): Promise<void> => {
  const q = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (q.status && q.status !== "all") conditions.push(eq(patientsTable.status, q.status as any));
  if (q.city) conditions.push(ilike(patientsTable.city, `%${q.city}%`));
  if (q.search) conditions.push(or(
    ilike(patientsTable.fullName, `%${q.search}%`),
    ilike(patientsTable.email, `%${q.search}%`),
    ilike(patientsTable.phone, `%${q.search}%`),
  ));

  const all = conditions.length
    ? await db.select().from(patientsTable).where(and(...conditions)).orderBy(desc(patientsTable.createdAt))
    : await db.select().from(patientsTable).orderBy(desc(patientsTable.createdAt));

  const { data, total, page, limit, totalPages } = paginate(all, parsePagination(q));
  res.json({ data, total, page, limit, totalPages });
});

router.get("/patients/stats", async (_req, res) => {
  const all = await db.select({ status: patientsTable.status }).from(patientsTable);
  res.json({
    total: all.length,
    active: all.filter(p => p.status === "ACTIVE").length,
    inactive: all.filter(p => p.status === "INACTIVE").length,
    suspended: all.filter(p => p.status === "SUSPENDED").length,
  });
});

router.get("/patients/:id", async (req, res): Promise<void> => {
  const patient = await db.select().from(patientsTable).where(eq(patientsTable.id, (req.params.id as string))).limit(1);
  if (!patient.length) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(patient[0]);
});

router.patch("/patients/:id/status", requireRole("SUPER_ADMIN", "ADMIN", "SUPPORT"), async (req, res): Promise<void> => {
  const { status } = req.body;
  const existing = await db.select().from(patientsTable).where(eq(patientsTable.id, (req.params.id as string))).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Patient not found" }); return; }
  await db.update(patientsTable).set({ status, updatedAt: new Date() }).where(eq(patientsTable.id, (req.params.id as string)));
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "PATIENT_STATUS_CHANGED", entityType: "Patient", entityId: (req.params.id as string), oldValue: { status: existing[0].status }, newValue: { status } });
  const updated = await db.select().from(patientsTable).where(eq(patientsTable.id, (req.params.id as string))).limit(1);
  res.json(updated[0]);
});

export default router;
