import { Router } from "express";
import { eq, ilike, and, or, desc, gte, lte } from "drizzle-orm";
import { db, appointmentsTable } from "../lib/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { paginate, parsePagination } from "../lib/pagination";
import { writeAudit } from "../lib/audit";

const router = Router();
router.use(requireAuth);

router.get("/appointments", async (req, res): Promise<void> => {
  const q = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (q.status && q.status !== "all") conditions.push(eq(appointmentsTable.status, q.status as any));
  if (q.doctorId) conditions.push(eq(appointmentsTable.doctorId, q.doctorId));
  if (q.patientId) conditions.push(eq(appointmentsTable.patientId, q.patientId));
  if (q.city) conditions.push(ilike(appointmentsTable.city, `%${q.city}%`));
  if (q.search) conditions.push(or(
    ilike(appointmentsTable.patientName, `%${q.search}%`),
    ilike(appointmentsTable.doctorName, `%${q.search}%`),
  ));
  if (q.from) conditions.push(gte(appointmentsTable.appointmentDate, new Date(q.from)));
  if (q.to) conditions.push(lte(appointmentsTable.appointmentDate, new Date(q.to)));

  const all = conditions.length
    ? await db.select().from(appointmentsTable).where(and(...conditions)).orderBy(desc(appointmentsTable.appointmentDate))
    : await db.select().from(appointmentsTable).orderBy(desc(appointmentsTable.appointmentDate));

  const { data, total, page, limit, totalPages } = paginate(all, parsePagination(q));
  res.json({ data, total, page, limit, totalPages });
});

router.get("/appointments/stats", async (_req, res) => {
  const all = await db.select({ status: appointmentsTable.status }).from(appointmentsTable);
  res.json({
    total: all.length,
    completed: all.filter(a => a.status === "COMPLETED").length,
    cancelled: all.filter(a => a.status === "CANCELLED").length,
    noShow: all.filter(a => a.status === "NO_SHOW").length,
    pending: all.filter(a => a.status === "HELD" || a.status === "CONFIRMED").length,
  });
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const appt = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, (req.params.id as string))).limit(1);
  if (!appt.length) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(appt[0]);
});

router.patch("/appointments/:id/status", requireRole("SUPER_ADMIN", "ADMIN", "SUPPORT"), async (req, res): Promise<void> => {
  const { status, cancellationReason } = req.body;
  const existing = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, (req.params.id as string))).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Appointment not found" }); return; }
  await db.update(appointmentsTable).set({ status, cancellationReason: cancellationReason ?? existing[0].cancellationReason, updatedAt: new Date() })
    .where(eq(appointmentsTable.id, (req.params.id as string)));
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "APPOINTMENT_STATUS_CHANGED", entityType: "Appointment", entityId: (req.params.id as string), oldValue: { status: existing[0].status }, newValue: { status } });
  const updated = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, (req.params.id as string))).limit(1);
  res.json(updated[0]);
});

export default router;
