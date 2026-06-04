import { Router } from "express";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { db, supportTicketsTable, ticketRepliesTable } from "../lib/db";
import { requireAuth, requireRole, SUPPORT_AND_ABOVE } from "../middlewares/auth";
import { paginate, parsePagination } from "../lib/pagination";
import { writeAudit } from "../lib/audit";

const router = Router();
router.use(requireAuth);

router.get("/support/tickets", async (req, res): Promise<void> => {
  const q = req.query as Record<string, string>;
  const conds: any[] = [];
  if (q.status && q.status !== "all") conds.push(eq(supportTicketsTable.status, q.status as any));
  if (q.priority) conds.push(eq(supportTicketsTable.priority, q.priority as any));
  if (q.category) conds.push(eq(supportTicketsTable.category, q.category as any));
  if (q.search) conds.push(or(
    ilike(supportTicketsTable.subject, `%${q.search}%`),
    ilike(supportTicketsTable.userName, `%${q.search}%`),
    ilike(supportTicketsTable.userEmail, `%${q.search}%`),
  ));
  const all = conds.length
    ? await db.select().from(supportTicketsTable).where(and(...conds)).orderBy(desc(supportTicketsTable.createdAt))
    : await db.select().from(supportTicketsTable).orderBy(desc(supportTicketsTable.createdAt));
  const result = paginate(all, parsePagination(q));
  res.json(result);
});

router.get("/support/stats", async (_req, res) => {
  const all = await db.select({ status: supportTicketsTable.status, priority: supportTicketsTable.priority }).from(supportTicketsTable);
  res.json({
    total: all.length,
    open: all.filter(t => t.status === "OPEN").length,
    in_progress: all.filter(t => t.status === "IN_PROGRESS").length,
    resolved: all.filter(t => t.status === "RESOLVED").length,
    closed: all.filter(t => t.status === "CLOSED").length,
    urgent: all.filter(t => t.priority === "URGENT").length,
  });
});

router.get("/support/tickets/:id", async (req, res): Promise<void> => {
  const ticket = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, (req.params.id as string))).limit(1);
  if (!ticket.length) { res.status(404).json({ error: "Ticket not found" }); return; }
  const replies = await db.select().from(ticketRepliesTable)
    .where(eq(ticketRepliesTable.ticketId, (req.params.id as string)))
    .orderBy(ticketRepliesTable.createdAt);
  res.json({ ...ticket[0], replies });
});

router.patch("/support/tickets/:id", requireRole(...SUPPORT_AND_ABOVE), async (req, res): Promise<void> => {
  const { status, assignedToAdminId, assignedToAdminName } = req.body;
  const existing = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, (req.params.id as string))).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Ticket not found" }); return; }
  const update: any = { updatedAt: new Date() };
  if (status) { update.status = status; if (status === "RESOLVED") update.resolvedAt = new Date(); }
  if (assignedToAdminId !== undefined) update.assignedToAdminId = assignedToAdminId;
  if (assignedToAdminName !== undefined) update.assignedToAdminName = assignedToAdminName;
  await db.update(supportTicketsTable).set(update).where(eq(supportTicketsTable.id, (req.params.id as string)));
  await writeAudit({ req, actorId: req.admin!.userId, actorName: req.admin!.fullName, actorRole: req.admin!.role, action: "TICKET_UPDATED", entityType: "SupportTicket", entityId: (req.params.id as string), oldValue: { status: existing[0].status }, newValue: { status } });
  const updated = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, (req.params.id as string))).limit(1);
  res.json(updated[0]);
});

router.post("/support/tickets/:id/reply", requireRole(...SUPPORT_AND_ABOVE), async (req, res): Promise<void> => {
  const { message, isInternal } = req.body;
  if (!message) { res.status(400).json({ error: "Message is required" }); return; }
  const ticket = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, (req.params.id as string))).limit(1);
  if (!ticket.length) { res.status(404).json({ error: "Ticket not found" }); return; }
  const reply = await db.insert(ticketRepliesTable).values({
    ticketId: (req.params.id as string),
    authorId: req.admin!.userId,
    authorName: req.admin!.fullName,
    authorRole: "ADMIN",
    message,
    isInternal: isInternal ? "true" : "false",
  }).returning();
  if (ticket[0].status === "OPEN") {
    await db.update(supportTicketsTable).set({ status: "IN_PROGRESS", updatedAt: new Date() }).where(eq(supportTicketsTable.id, (req.params.id as string)));
  }
  res.status(201).json(reply[0]);
});

export default router;
