import { Router } from "express";
import { paginate, parsePagination } from "../lib/pagination";

const router = Router();

const refunds = [
  { id: "ref1", appointment_id: "apt4", patient_name: "Hamza Hassan", doctor_name: "Dr. Maryam Siddiqui", amount: 1200, reason: "Doctor unavailable", status: "REQUESTED", requested_at: "2025-05-21T22:00:00Z", payment_method: "Raast", updated_at: "2025-05-21T22:00:00Z", admin_notes: null },
  { id: "ref2", appointment_id: "apt3", patient_name: "Sana Imran", doctor_name: "Dr. Usman Javed", amount: 800, reason: "Doctor no-show", status: "APPROVED", requested_at: "2025-05-22T10:00:00Z", payment_method: "JazzCash", updated_at: "2025-05-22T11:00:00Z", admin_notes: "Approved after verification" },
  { id: "ref3", appointment_id: "apt7", patient_name: "Fatima Noor", doctor_name: "Dr. Ayesha Noor", amount: 1500, reason: "Doctor was late", status: "REJECTED", requested_at: "2025-05-21T15:00:00Z", payment_method: "JazzCash", updated_at: "2025-05-21T16:00:00Z", admin_notes: "Partial service was rendered" },
  { id: "ref4", appointment_id: "apt1", patient_name: "Ayesha Khan", doctor_name: "Dr. Hina Fatima", amount: 1300, reason: "Changed mind", status: "PROCESSED", requested_at: "2025-05-20T08:00:00Z", payment_method: "JazzCash", updated_at: "2025-05-20T12:00:00Z", admin_notes: "Processed via JazzCash portal" },
  { id: "ref5", appointment_id: "apt2", patient_name: "Ali Raza", doctor_name: "Dr. Faisal Mahmood", amount: 900, reason: "Technical issue", status: "REQUESTED", requested_at: "2025-05-23T09:00:00Z", payment_method: "Easypaisa", updated_at: "2025-05-23T09:00:00Z", admin_notes: null },
];

router.get("/refunds", (req, res) => {
  let filtered = [...refunds];
  const q = req.query as Record<string, string>;
  if (q.status && q.status !== "all") filtered = filtered.filter(r => r.status === q.status);
  const result = paginate(filtered, parsePagination(q));
  res.json(result);
});

router.get("/refunds/stats", (req, res) => {
  res.json({
    pending: refunds.filter(r => r.status === "REQUESTED").length,
    approved: refunds.filter(r => r.status === "APPROVED").length,
    processed: refunds.filter(r => r.status === "PROCESSED").length,
    rejected: refunds.filter(r => r.status === "REJECTED").length,
    total_amount: refunds.reduce((s, r) => s + r.amount, 0),
  });
});

router.get("/refunds/:id", (req, res): void => {
  const refund = refunds.find(r => r.id === req.params.id);
  if (!refund) { res.status(404).json({ error: "Refund not found" }); return; }
  res.json(refund);
});

router.patch("/refunds/:id", (req, res): void => {
  const refund = refunds.find(r => r.id === req.params.id);
  if (!refund) { res.status(404).json({ error: "Refund not found" }); return; }
  Object.assign(refund, req.body, { updated_at: new Date().toISOString() });
  res.json(refund);
});

export default router;
