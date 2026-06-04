import { Router } from "express";
import { paginate, parsePagination } from "../lib/pagination";

const router = Router();

const notifications = [
  { id: "n1", user_id: "admin", title: "New Doctor Registration", message: "Dr. Hassan Malik has submitted verification documents.", type: "VERIFICATION", channel: "IN_APP", status: "READ", entity_type: "Doctor", entity_id: "d8", created_at: "2025-05-22T09:00:00Z" },
  { id: "n2", user_id: "admin", title: "Refund Request", message: "Patient Ayesha Khan has requested a refund for appointment #apt4.", type: "PAYMENT", channel: "IN_APP", status: "PENDING", entity_type: "Refund", entity_id: "ref1", created_at: "2025-05-22T08:30:00Z" },
  { id: "n3", user_id: "admin", title: "High Priority Ticket", message: "Ticket TKT-2025-1847 has been escalated.", type: "SUPPORT", channel: "IN_APP", status: "PENDING", entity_type: "Ticket", entity_id: "t7", created_at: "2025-05-22T07:00:00Z" },
  { id: "n4", user_id: "admin", title: "Payout Request", message: "Dr. Ayesha Noor has requested a payout of PKR 45,000.", type: "PAYOUT", channel: "IN_APP", status: "PENDING", entity_type: "Payout", entity_id: "po1", created_at: "2025-05-22T08:00:00Z" },
  { id: "n5", user_id: "admin", title: "Review Reported", message: "A review has been reported for Dr. Usman Javed.", type: "REVIEW", channel: "IN_APP", status: "READ", entity_type: "Review", entity_id: "rv4", created_at: "2025-05-21T13:30:00Z" },
  { id: "n6", user_id: "admin", title: "New Doctor Registration", message: "Dr. Usman Tariq has submitted verification documents.", type: "VERIFICATION", channel: "IN_APP", status: "PENDING", entity_type: "Doctor", entity_id: "d2", created_at: "2025-05-21T10:00:00Z" },
];

router.get("/notifications", (req, res) => {
  let filtered = [...notifications];
  const q = req.query as Record<string, string>;
  if (q.status && q.status !== "all") filtered = filtered.filter(n => n.status === q.status);
  if (q.type) filtered = filtered.filter(n => n.type === q.type);
  const result = paginate(filtered, parsePagination(q));
  res.json(result);
});

router.get("/notifications/unread-count", (req, res) => {
  res.json({ count: notifications.filter(n => n.status === "PENDING").length });
});

router.patch("/notifications/:id/read", (req, res): void => {
  const n = notifications.find(n => n.id === req.params.id);
  if (!n) { res.status(404).json({ error: "Notification not found" }); return; }
  n.status = "READ";
  res.json(n);
});

router.post("/notifications/mark-all-read", (req, res) => {
  notifications.forEach(n => { n.status = "READ"; });
  res.json({ success: true });
});

export default router;
