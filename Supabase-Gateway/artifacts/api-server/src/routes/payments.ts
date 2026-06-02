import { Router } from "express";

const router = Router();

const payments = [
  { id: "txn1", amount: 1200, gateway: "JazzCash", status: "completed", date: "2025-05-22T11:32:00Z", patient_name: "Ayesha Khan", doctor_name: "Dr. Hina Fatima", appointment_id: "apt1", consultation_fee: 1300, platform_fee: 130, tax: 208, refund_status: null },
  { id: "txn2", amount: 800, gateway: "Easypaisa", status: "completed", date: "2025-05-22T10:15:00Z", patient_name: "Ali Raza", doctor_name: "Dr. Faisal Mahmood", appointment_id: "apt2", consultation_fee: 900, platform_fee: 90, tax: 144, refund_status: null },
  { id: "txn3", amount: 1000, gateway: "Raast", status: "completed", date: "2025-05-22T09:05:00Z", patient_name: "Sara Malik", doctor_name: "Dr. Hina Fatima", appointment_id: "apt5", consultation_fee: 1000, platform_fee: 100, tax: 160, refund_status: null },
  { id: "txn4", amount: 1500, gateway: "JazzCash", status: "refunded", date: "2025-05-21T19:48:00Z", patient_name: "Usman Javed", doctor_name: "Dr. Maryam Siddiqui", appointment_id: "apt4", consultation_fee: 1500, platform_fee: 150, tax: 240, refund_status: "refunded" },
  { id: "txn5", amount: 600, gateway: "Easypaisa", status: "pending", date: "2025-05-21T06:21:00Z", patient_name: "Fatima Noor", doctor_name: null, appointment_id: null, consultation_fee: null, platform_fee: null, tax: null, refund_status: null },
  { id: "txn6", amount: 2000, gateway: "JazzCash", status: "failed", date: "2025-05-21T14:10:00Z", patient_name: "Hamza Hassan", doctor_name: "Dr. Bilal Ahmad", appointment_id: null, consultation_fee: null, platform_fee: null, tax: null, refund_status: null },
  { id: "txn7", amount: 1800, gateway: "Raast", status: "completed", date: "2025-05-20T16:30:00Z", patient_name: "Zainab Malik", doctor_name: "Dr. Sarah Khan", appointment_id: "apt6", consultation_fee: 1800, platform_fee: 180, tax: 288, refund_status: null },
  { id: "txn8", amount: 900, gateway: "Easypaisa", status: "completed", date: "2025-05-20T11:15:00Z", patient_name: "Bilal Ahmed", doctor_name: "Dr. Ayesha Noor", appointment_id: null, consultation_fee: 900, platform_fee: 90, tax: 144, refund_status: null },
];

router.get("/payments", (req, res) => {
  let filtered = [...payments];
  const { status, gateway, page = "1", limit = "10" } = req.query as Record<string, string>;

  if (status && status !== "all") filtered = filtered.filter(p => p.status === status);
  if (gateway) filtered = filtered.filter(p => p.gateway.toLowerCase() === gateway.toLowerCase());

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = filtered.length;
  const data = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

router.get("/payments/stats", (req, res) => {
  res.json({
    total_collected: 24680000,
    matched: 24155000,
    unmatched: 525000,
    failed_count: 186,
    doctor_pending_payouts: 2456700,
    by_gateway: [
      { gateway: "JazzCash", amount: 12458700, percentage: 50.5 },
      { gateway: "Easypaisa", amount: 9236450, percentage: 37.4 },
      { gateway: "Raast", amount: 2985610, percentage: 12.1 },
    ],
  });
});

router.get("/payments/:id", (req, res): void => {
  const payment = payments.find(p => p.id === req.params.id);
  if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
  res.json(payment);
});

router.post("/payments/:id/refund", (req, res): void => {
  const payment = payments.find(p => p.id === req.params.id);
  if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
  payment.refund_status = "refunded";
  payment.status = "refunded";
  res.json(payment);
});

export default router;
