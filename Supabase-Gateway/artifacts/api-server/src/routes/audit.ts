import { Router } from "express";
import { eq, and, desc, ilike, count } from "drizzle-orm";
import { db, auditLogsTable } from "../lib/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { paginate, parsePagination } from "../lib/pagination";

const router = Router();
router.use(requireAuth);

router.get("/audit/logs", async (req, res): Promise<void> => {
  const q = req.query as Record<string, string>;
  const conds: any[] = [];
  if (q.actorId) conds.push(eq(auditLogsTable.actorId, q.actorId));
  if (q.entityType) conds.push(ilike(auditLogsTable.entityType, `%${q.entityType}%`));
  if (q.action) conds.push(ilike(auditLogsTable.action, `%${q.action}%`));
  const all = conds.length
    ? await db.select().from(auditLogsTable).where(and(...conds)).orderBy(desc(auditLogsTable.createdAt))
    : await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt));
  const result = paginate(all, parsePagination(q));
  res.json(result);
});

router.get("/audit/stats", async (_req, res) => {
  const total = await db.select({ n: count() }).from(auditLogsTable);
  const actorCounts = await db.select({ actorName: auditLogsTable.actorName, n: count() })
    .from(auditLogsTable).groupBy(auditLogsTable.actorName).orderBy(desc(count())).limit(5);
  res.json({
    total_logs: total[0]?.n ?? 0,
    top_actors: actorCounts,
  });
});

export default router;
