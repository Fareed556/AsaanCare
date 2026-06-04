import { Router } from "express";
import { paginate, parsePagination } from "../lib/pagination";

const router = Router();

const payouts = [
  { id: "po1", doctor_id: "d1", doctor_name: "Dr. Ayesha Noor", amount: 45000, status: "PENDING", bank_name: "HBL", account_title: "Ayesha Noor", account_number: "01234567890", iban: "PK36HABB0000000123456789", wallet_provider: null, wallet_number: null, requested_at: "2025-05-22T08:00:00Z", processed_at: null, admin_notes: null },
  { id: "po2", doctor_id: "d4", doctor_name: "Dr. Bilal Ahmad", amount: 32000, status: "APPROVED", bank_name: "MCB", account_title: "Bilal Ahmad", account_number: "0987654321", iban: "PK36MCBL0000000987654321", wallet_provider: null, wallet_number: null, requested_at: "2025-05-20T10:00:00Z", processed_at: null, admin_notes: "Approved by finance team" },
  { id: "po3", doctor_id: "d9", doctor_name: "Dr. Faisal Mahmood", amount: 78000, status: "PAID", bank_name: null, account_title: null, account_number: null, iban: null, wallet_provider: "JazzCash", wallet_number: "0300-1234567", requested_at: "2025-05-18T09:00:00Z", processed_at: "2025-05-19T14:00:00Z", admin_notes: "Paid via JazzCash" },
  { id: "po4", doctor_id: "d5", doctor_name: "Dr. Sana Khan", amount: 22000, status: "REJECTED", bank_name: "UBL", account_title: "Sana Khan", account_number: "1122334455", iban: "PK36UNIL0000001122334455", wallet_provider: null, wallet_number: null, requested_at: "2025-05-15T11:00:00Z", processed_at: null, admin_notes: "IBAN mismatch" },
  { id: "po5", doctor_id: "d6", doctor_name: "Dr. Farhan Malik", amount: 15000, status: "PENDING", bank_name: "Meezan", account_title: "Farhan Malik", account_number: "5544332211", iban: "PK36MEZN0000005544332211", wallet_provider: null, wallet_number: null, requested_at: "2025-05-23T07:00:00Z", processed_at: null, admin_notes: null },
];

router.get("/payouts", (req, res) => {
  let filtered = [...payouts];
  const q = req.query as Record<string, string>;
  if (q.status && q.status !== "all") filtered = filtered.filter(p => p.status === q.status);
  if (q.doctor_id) filtered = filtered.filter(p => p.doctor_id === q.doctor_id);
  const result = paginate(filtered, parsePagination(q));
  res.json(result);
});

router.get("/payouts/stats", (req, res) => {
  res.json({
    pending: payouts.filter(p => p.status === "PENDING").length,
    approved: payouts.filter(p => p.status === "APPROVED").length,
    paid: payouts.filter(p => p.status === "PAID").length,
    rejected: payouts.filter(p => p.status === "REJECTED").length,
    total_pending_amount: payouts.filter(p => ["PENDING","APPROVED"].includes(p.status)).reduce((s, p) => s + p.amount, 0),
  });
});

router.get("/payouts/:id", (req, res): void => {
  const payout = payouts.find(p => p.id === req.params.id);
  if (!payout) { res.status(404).json({ error: "Payout not found" }); return; }
  res.json(payout);
});

router.patch("/payouts/:id", (req, res): void => {
  const payout = payouts.find(p => p.id === req.params.id);
  if (!payout) { res.status(404).json({ error: "Payout not found" }); return; }
  const now = new Date().toISOString();
  Object.assign(payout, req.body);
  if (req.body.status === "PAID") payout.processed_at = now;
  res.json(payout);
});

export default router;
