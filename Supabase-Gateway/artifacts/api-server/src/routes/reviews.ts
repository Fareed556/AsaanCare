import { Router } from "express";
import { paginate, parsePagination } from "../lib/pagination";

const router = Router();

const reviews = [
  { id: "rv1", appointment_id: "apt2", patient_name: "Ali Raza", doctor_name: "Dr. Faisal Mahmood", doctor_specialty: "General Medicine", rating: 5, comment: "Excellent doctor, very thorough and caring.", status: "PUBLISHED", created_at: "2025-05-22T12:00:00Z", report_reason: null },
  { id: "rv2", appointment_id: "apt5", patient_name: "Zainab Malik", doctor_name: "Dr. Bilal Ahmad", doctor_specialty: "Dermatology", rating: 4, comment: "Good consultation but had to wait a bit.", status: "PUBLISHED", created_at: "2025-05-21T19:00:00Z", report_reason: null },
  { id: "rv3", appointment_id: "apt6", patient_name: "Ahmed Sheikh", doctor_name: "Dr. Sarah Khan", doctor_specialty: "Psychiatry", rating: 3, comment: "Average experience, needs improvement.", status: "PENDING", created_at: "2025-05-21T17:30:00Z", report_reason: null },
  { id: "rv4", appointment_id: "apt8", patient_name: "Mohsin Tariq", doctor_name: "Dr. Usman Javed", doctor_specialty: "ENT", rating: 1, comment: "Very rude doctor, would not recommend.", status: "REPORTED", created_at: "2025-05-21T13:00:00Z", report_reason: "Fake/spam review" },
  { id: "rv5", appointment_id: "apt1", patient_name: "Ayesha Khan", doctor_name: "Dr. Hina Fatima", doctor_specialty: "Gynecology", rating: 5, comment: "Best doctor in Lahore! Highly recommended.", status: "PUBLISHED", created_at: "2025-05-22T14:00:00Z", report_reason: null },
  { id: "rv6", appointment_id: "apt7", patient_name: "Fatima Noor", doctor_name: "Dr. Ayesha Noor", doctor_specialty: "Cardiology", rating: 2, comment: "Doctor was late by 20 minutes. Unprofessional.", status: "PENDING", created_at: "2025-05-21T16:00:00Z", report_reason: null },
];

router.get("/reviews", (req, res) => {
  let filtered = [...reviews];
  const q = req.query as Record<string, string>;
  if (q.status && q.status !== "all") filtered = filtered.filter(r => r.status === q.status);
  if (q.doctor_id) filtered = filtered.filter(r => r.appointment_id.includes(q.doctor_id));
  const result = paginate(filtered, parsePagination(q));
  res.json(result);
});

router.get("/reviews/stats", (req, res) => {
  res.json({
    total: reviews.length,
    pending: reviews.filter(r => r.status === "PENDING").length,
    published: reviews.filter(r => r.status === "PUBLISHED").length,
    reported: reviews.filter(r => r.status === "REPORTED").length,
    hidden: reviews.filter(r => r.status === "HIDDEN").length,
    avg_rating: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
  });
});

router.get("/reviews/:id", (req, res): void => {
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  res.json(review);
});

router.patch("/reviews/:id", (req, res): void => {
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  Object.assign(review, req.body);
  res.json(review);
});

export default router;
