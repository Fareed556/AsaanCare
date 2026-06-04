import { Router } from "express";
import { eq, ilike, and, or, sql, desc } from "drizzle-orm";
import { db, doctorsTable, doctorVerificationsTable } from "../lib/db";
import { requireAuth, requireRole, VERIFIER_AND_ABOVE, ALL_ROLES } from "../middlewares/auth";
import { paginate, parsePagination } from "../lib/pagination";
import { writeAudit } from "../lib/audit";

const router = Router();
router.use(requireAuth);

router.get("/doctors", async (req, res): Promise<void> => {
  const q = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (q.status && q.status !== "all") conditions.push(eq(doctorsTable.verificationStatus, q.status as any));
  if (q.specialty) conditions.push(ilike(doctorsTable.specialty, `%${q.specialty}%`));
  if (q.city) conditions.push(ilike(doctorsTable.city, `%${q.city}%`));
  if (q.search) conditions.push(or(
    ilike(doctorsTable.fullName, `%${q.search}%`),
    ilike(doctorsTable.pmdcNumber, `%${q.search}%`),
    ilike(doctorsTable.specialty, `%${q.search}%`),
  ));

  const all = conditions.length
    ? await db.select().from(doctorsTable).where(and(...conditions)).orderBy(desc(doctorsTable.createdAt))
    : await db.select().from(doctorsTable).orderBy(desc(doctorsTable.createdAt));

  const { data, total, page, limit, totalPages } = paginate(all, parsePagination(q));
  res.json({ data, total, page, limit, totalPages });
});

router.get("/doctors/stats", async (_req, res) => {
  const all = await db.select({ status: doctorsTable.verificationStatus }).from(doctorsTable);
  res.json({
    total: all.length,
    verified: all.filter(d => d.status === "VERIFIED").length,
    pending: all.filter(d => d.status === "PENDING" || d.status === "IN_REVIEW").length,
    suspended: all.filter(d => d.status === "SUSPENDED").length,
    rejected: all.filter(d => d.status === "REJECTED").length,
  });
});

router.get("/doctors/:id", async (req, res): Promise<void> => {
  const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.id, (req.params.id as string))).limit(1);
  if (!doctor.length) { res.status(404).json({ error: "Doctor not found" }); return; }
  res.json(doctor[0]);
});

router.patch("/doctors/:id", async (req, res): Promise<void> => {
  const existing = await db.select().from(doctorsTable).where(eq(doctorsTable.id, (req.params.id as string))).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Doctor not found" }); return; }
  const { id: _id, createdAt: _c, ...allowed } = req.body;
  const updated = await db.update(doctorsTable).set({ ...allowed, updatedAt: new Date() })
    .where(eq(doctorsTable.id, (req.params.id as string))).returning();
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "DOCTOR_UPDATED", entityType: "Doctor", entityId: (req.params.id as string) });
  res.json(updated[0]);
});

router.get("/doctors/:id/verification", async (req, res): Promise<void> => {
  const ver = await db.select().from(doctorVerificationsTable)
    .where(eq(doctorVerificationsTable.doctorId, (req.params.id as string)))
    .orderBy(desc(doctorVerificationsTable.createdAt)).limit(1);
  res.json(ver[0] ?? null);
});

router.post("/doctors/:id/verification/approve", requireRole(...VERIFIER_AND_ABOVE), async (req, res): Promise<void> => {
  const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.id, (req.params.id as string))).limit(1);
  if (!doctor.length) { res.status(404).json({ error: "Doctor not found" }); return; }
  if (!["PENDING", "IN_REVIEW"].includes(doctor[0].verificationStatus)) {
    res.status(400).json({ error: "Doctor is not in a reviewable state" }); return;
  }
  await db.update(doctorsTable).set({ verificationStatus: "VERIFIED", updatedAt: new Date() }).where(eq(doctorsTable.id, (req.params.id as string)));
  await db.update(doctorVerificationsTable).set({ status: "VERIFIED", reviewedAt: new Date(), reviewedByAdminId: req.admin!.adminId }).where(eq(doctorVerificationsTable.doctorId, (req.params.id as string)));
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "DOCTOR_APPROVED", entityType: "Doctor", entityId: (req.params.id as string), oldValue: { status: doctor[0].verificationStatus }, newValue: { status: "VERIFIED" } });
  const updated = await db.select().from(doctorsTable).where(eq(doctorsTable.id, (req.params.id as string))).limit(1);
  res.json(updated[0]);
});

router.post("/doctors/:id/verification/reject", requireRole(...VERIFIER_AND_ABOVE), async (req, res): Promise<void> => {
  const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.id, (req.params.id as string))).limit(1);
  if (!doctor.length) { res.status(404).json({ error: "Doctor not found" }); return; }
  const { reason } = req.body;
  if (!reason) { res.status(400).json({ error: "Rejection reason required" }); return; }
  await db.update(doctorsTable).set({ verificationStatus: "REJECTED", updatedAt: new Date() }).where(eq(doctorsTable.id, (req.params.id as string)));
  await db.update(doctorVerificationsTable).set({ status: "REJECTED", rejectionReason: reason, reviewedAt: new Date(), reviewedByAdminId: req.admin!.adminId }).where(eq(doctorVerificationsTable.doctorId, (req.params.id as string)));
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "DOCTOR_REJECTED", entityType: "Doctor", entityId: (req.params.id as string), newValue: { status: "REJECTED", reason } });
  const updated = await db.select().from(doctorsTable).where(eq(doctorsTable.id, (req.params.id as string))).limit(1);
  res.json(updated[0]);
});

router.patch("/doctors/:id/status", requireRole("SUPER_ADMIN", "ADMIN"), async (req, res): Promise<void> => {
  const { status } = req.body;
  const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.id, (req.params.id as string))).limit(1);
  if (!doctor.length) { res.status(404).json({ error: "Doctor not found" }); return; }
  await db.update(doctorsTable).set({ verificationStatus: status, updatedAt: new Date() }).where(eq(doctorsTable.id, (req.params.id as string)));
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "DOCTOR_STATUS_CHANGED", entityType: "Doctor", entityId: (req.params.id as string), oldValue: { status: doctor[0].verificationStatus }, newValue: { status } });
  const updated = await db.select().from(doctorsTable).where(eq(doctorsTable.id, (req.params.id as string))).limit(1);
  res.json(updated[0]);
});

export default router;
