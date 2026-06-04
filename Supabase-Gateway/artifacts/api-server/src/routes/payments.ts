import { Router } from "express";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { db, paymentsTable } from "../lib/db";
import { requireAuth } from "../middlewares/auth";
import { paginate, parsePagination } from "../lib/pagination";

const router = Router();
router.use(requireAuth);

router.get("/payments", async (req, res): Promise<void> => {
  const q = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (q.status && q.status !== "all") conditions.push(eq(paymentsTable.status, q.status as any));
  if (q.method && q.method !== "all") conditions.push(eq(paymentsTable.method, q.method as any));
  if (q.doctorId) conditions.push(eq(paymentsTable.doctorId, q.doctorId));
  if (q.search) conditions.push(or(
    ilike(paymentsTable.patientName, `%${q.search}%`),
    ilike(paymentsTable.doctorName, `%${q.search}%`),
    ilike(paymentsTable.transactionRef, `%${q.search}%`),
  ));

  const all = conditions.length
    ? await db.select().from(paymentsTable).where(and(...conditions)).orderBy(desc(paymentsTable.createdAt))
    : await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt));

  const { data, total, page, limit, totalPages } = paginate(all, parsePagination(q));
  res.json({ data, total, page, limit, totalPages });
});

router.get("/payments/:id", async (req, res): Promise<void> => {
  const pay = await db.select().from(paymentsTable).where(eq(paymentsTable.id, req.params.id)).limit(1);
  if (!pay.length) { res.status(404).json({ error: "Payment not found" }); return; }
  res.json(pay[0]);
});

export default router;
