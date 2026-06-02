import { Router } from "express";

const router = Router();

const tickets = [
  { id: "t1", ticket_id: "TKT-2025-1847", category: "Refund Request", status: "open", priority: "high", raised_by: "Ayesha Khan", user_type: "patient", date: "2025-05-22T10:24:00Z", assigned_to: "Ayesha Khan (Agent)", description: "I was charged for a consultation but the doctor was not available.", resolution_notes: null, linked_appointment_id: "apt4", refund_amount: 1200 },
  { id: "t2", ticket_id: "TKT-2025-1846", category: "Doctor No-Show", status: "in-progress", priority: "high", raised_by: "Ali Raza", user_type: "patient", date: "2025-05-22T09:46:00Z", assigned_to: "Bilal Ahmed (Agent)", description: "Doctor did not show up for scheduled consultation.", resolution_notes: null, linked_appointment_id: "apt3", refund_amount: 800 },
  { id: "t3", ticket_id: "TKT-2025-1845", category: "Appointment Issue", status: "in-progress", priority: "medium", raised_by: "Hina Fatima", user_type: "patient", date: "2025-05-22T09:15:00Z", assigned_to: "Ayesha Khan (Agent)", description: "Cannot reschedule appointment.", resolution_notes: null, linked_appointment_id: "apt5", refund_amount: null },
  { id: "t4", ticket_id: "TKT-2025-1844", category: "Payment Issue", status: "resolved", priority: "medium", raised_by: "Hamza Hassan", user_type: "patient", date: "2025-05-22T08:32:00Z", assigned_to: "Usman Javed (Agent)", description: "Double charge on JazzCash.", resolution_notes: "Refund processed successfully.", linked_appointment_id: null, refund_amount: 900 },
  { id: "t5", ticket_id: "TKT-2025-1843", category: "Prescription Issue", status: "in-progress", priority: "low", raised_by: "Sara Imran", user_type: "patient", date: "2025-05-21T11:06:00Z", assigned_to: null, description: "Cannot access prescription from last consultation.", resolution_notes: null, linked_appointment_id: "apt2", refund_amount: null },
  { id: "t6", ticket_id: "TKT-2025-1842", category: "Profile Update", status: "resolved", priority: "low", raised_by: "Bilal Ahmed", user_type: "patient", date: "2025-05-21T13:58:00Z", assigned_to: "Usman Javed (Agent)", description: "Unable to update phone number.", resolution_notes: "Profile updated by admin.", linked_appointment_id: null, refund_amount: null },
  { id: "t7", ticket_id: "TKT-2025-1841", category: "Refund Request", status: "escalated", priority: "high", raised_by: "Usman Javed", user_type: "patient", date: "2025-05-21T16:05:00Z", assigned_to: "Senior Admin", description: "Urgent refund needed for cancelled appointment.", resolution_notes: null, linked_appointment_id: "apt4", refund_amount: 2000 },
  { id: "t8", ticket_id: "TKT-2025-1840", category: "Doctor No-Show", status: "resolved", priority: "medium", raised_by: "Maryam Siddiqui", user_type: "patient", date: "2025-05-21T17:42:00Z", assigned_to: "Bilal Ahmed (Agent)", description: "Doctor was 30 minutes late.", resolution_notes: "Partial refund of PKR 300 issued.", linked_appointment_id: "apt7", refund_amount: 300 },
];

router.get("/support/tickets", (req, res) => {
  let filtered = [...tickets];
  const { status, priority, user_type, assigned_to, page = "1", limit = "10" } = req.query as Record<string, string>;

  if (status && status !== "all") filtered = filtered.filter(t => t.status === status);
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  if (user_type) filtered = filtered.filter(t => t.user_type === user_type);

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = filtered.length;
  const data = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

router.get("/support/stats", (req, res) => {
  res.json({
    avg_response_time: "18m 24s",
    sla_breaches: 24,
    avg_resolution_time: "2h 36m",
    tickets_closed_week: 842,
    sla_compliance: 92,
    agent_performance: [
      { agent_name: "Ayesha Khan", score: 97 },
      { agent_name: "Bilal Ahmed", score: 95 },
      { agent_name: "Sana Imran", score: 94 },
      { agent_name: "Usman Javed", score: 92 },
    ],
  });
});

router.get("/support/tickets/:id", (req, res): void => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  res.json(ticket);
});

router.patch("/support/tickets/:id", (req, res): void => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  Object.assign(ticket, req.body);
  res.json(ticket);
});

export default router;
