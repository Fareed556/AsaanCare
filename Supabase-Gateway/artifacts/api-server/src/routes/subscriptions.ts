import { Router } from "express";

const router = Router();

const plans = [
  {
    id: "plan_free", name: "Free", price: 0, billing_cycle: "monthly",
    features: { video_consults: 0, lab_tests: 0, priority_appointments: 0, family_members: 1, health_locker_storage: "100 MB", dedicated_support: false },
    active_subscribers: 8420,
  },
  {
    id: "plan_basic", name: "Basic", price: 1499, billing_cycle: "monthly",
    features: { video_consults: 4, lab_tests: 10, priority_appointments: 1, family_members: 2, health_locker_storage: "1 GB", dedicated_support: false },
    active_subscribers: 2840,
  },
  {
    id: "plan_standard", name: "Standard", price: 2999, billing_cycle: "monthly",
    features: { video_consults: 10, lab_tests: 20, priority_appointments: 2, family_members: 3, health_locker_storage: "20 GB", dedicated_support: true },
    active_subscribers: 960,
  },
  {
    id: "plan_family", name: "Family", price: 4999, billing_cycle: "monthly",
    features: { video_consults: "Unlimited", lab_tests: "Unlimited", priority_appointments: "Unlimited", family_members: "Up to 6", health_locker_storage: "50 GB", dedicated_support: true },
    active_subscribers: 320,
  },
];

const subscriptions = [
  { id: "sub1", patient_name: "Ayesha Khan", patient_age: 28, patient_gender: "Female", plan: "Standard", start_date: "2025-04-22", renewal_date: "2025-05-22", status: "active", amount: 2999, days_until_renewal: 3 },
  { id: "sub2", patient_name: "Muhammad Ali", patient_age: 34, patient_gender: "Male", plan: "Basic", start_date: "2025-04-18", renewal_date: "2025-05-18", status: "overdue", amount: 1499, days_until_renewal: 0 },
  { id: "sub3", patient_name: "Sara Imran", patient_age: 27, patient_gender: "Female", plan: "Family", start_date: "2025-04-19", renewal_date: "2025-06-15", status: "active", amount: 4999, days_until_renewal: 23 },
  { id: "sub4", patient_name: "Usman Javed", patient_age: 41, patient_gender: "Male", plan: "Basic", start_date: "2025-03-22", renewal_date: "2025-05-22", status: "active", amount: 1499, days_until_renewal: 3 },
  { id: "sub5", patient_name: "Fatima Noor", patient_age: 32, patient_gender: "Female", plan: "Basic", start_date: "2025-03-15", renewal_date: "2025-05-15", status: "cancelled", amount: 1499, days_until_renewal: null },
];

router.get("/subscriptions", (req, res) => {
  let filtered = [...subscriptions];
  const { status, plan, page = "1", limit = "10" } = req.query as Record<string, string>;

  if (status && status !== "all") filtered = filtered.filter(s => s.status === status);
  if (plan) filtered = filtered.filter(s => s.plan.toLowerCase() === plan.toLowerCase());

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = filtered.length;
  const data = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

router.get("/subscriptions/plans", (req, res) => {
  res.json(plans);
});

router.get("/subscriptions/stats", (req, res) => {
  res.json({
    mrr: 24680000,
    mrr_change: 12.8,
    active_subscribers: 12540,
    active_subscribers_change: 8.4,
    churn_rate: 2.35,
    renewals_this_month: 1256,
    plan_distribution: [
      { plan: "Free", count: 8420, percentage: 67.1 },
      { plan: "Basic", count: 2840, percentage: 22.6 },
      { plan: "Standard", count: 960, percentage: 7.7 },
      { plan: "Family", count: 320, percentage: 2.6 },
    ],
  });
});

export default router;
