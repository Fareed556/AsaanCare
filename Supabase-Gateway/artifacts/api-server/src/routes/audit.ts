import { Router } from "express";

const router = Router();

const auditLogs = [
  { id: "al1", admin_user: "Ayesha Malik", action_type: "Updated Doctor Profile", entity_type: "Doctor", entity_id: "d1", entity_name: "Dr. Ali Raza", timestamp: "2025-05-22T11:45:00Z", ip_address: "103.26.12.45" },
  { id: "al2", admin_user: "Usman Khan", action_type: "Updated Patient Record", entity_type: "Patient", entity_id: "p2", entity_name: "Hamza Hassan", timestamp: "2025-05-22T10:32:00Z", ip_address: "182.74.91.23" },
  { id: "al3", admin_user: "Sana Iman", action_type: "Processed Refund", entity_type: "Payment", entity_id: "txn4", entity_name: "PKR #PRR-2456/8", timestamp: "2025-05-22T09:18:00Z", ip_address: "45.122.33.12" },
  { id: "al4", admin_user: "Admin User", action_type: "Verified Doctor", entity_type: "Doctor", entity_id: "d3", entity_name: "Dr. Hina Fatima", timestamp: "2025-05-22T08:30:00Z", ip_address: "203.99.87.61" },
  { id: "al5", admin_user: "Ayesha Malik", action_type: "Changed Admin Role", entity_type: "Admin", entity_id: "au3", entity_name: "Usman Khan", timestamp: "2025-05-21T06:40:00Z", ip_address: "103.26.12.45" },
  { id: "al6", admin_user: "Sana Iman", action_type: "Generated Invoice", entity_type: "Payment", entity_id: "txn7", entity_name: "INV-78231", timestamp: "2025-05-21T05:22:00Z", ip_address: "45.122.33.12" },
  { id: "al7", admin_user: "Bilal Ahmed", action_type: "Resolved Support Ticket", entity_type: "Ticket", entity_id: "t2", entity_name: "SUP-9921", timestamp: "2025-05-21T04:15:00Z", ip_address: "203.99.87.61" },
  { id: "al8", admin_user: "Bilal Ahmed", action_type: "Rejected Doctor", entity_type: "Doctor", entity_id: "d8", entity_name: "Dr. Zain Ahmad", timestamp: "2025-05-21T03:02:00Z", ip_address: "203.99.87.61" },
  { id: "al9", admin_user: "Admin User", action_type: "Blocked Patient", entity_type: "Patient", entity_id: "p5", entity_name: "Zainab Hassan", timestamp: "2025-05-20T22:10:00Z", ip_address: "192.168.1.45" },
  { id: "al10", admin_user: "Usman Khan", action_type: "Updated Subscription Plan", entity_type: "Subscription", entity_id: "sub3", entity_name: "Sara Imran - Family Plan", timestamp: "2025-05-20T20:05:00Z", ip_address: "182.74.91.23" },
];

router.get("/audit/logs", (req, res) => {
  let filtered = [...auditLogs];
  const { user_id, action_type, entity_type, page = "1", limit = "10" } = req.query as Record<string, string>;

  if (action_type) filtered = filtered.filter(l => l.action_type.toLowerCase().includes(action_type.toLowerCase()));
  if (entity_type) filtered = filtered.filter(l => l.entity_type.toLowerCase() === entity_type.toLowerCase());

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = filtered.length;
  const data = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

router.get("/audit/stats", (req, res) => {
  res.json({
    active_admins: 42,
    active_admins_change: 12.0,
    suspicious_events: 18,
    suspicious_events_change: 22.0,
    locked_accounts: 7,
    locked_accounts_change: 16.0,
    recent_compliance_actions: 30,
    recent_compliance_actions_change: 30.0,
  });
});

export default router;
