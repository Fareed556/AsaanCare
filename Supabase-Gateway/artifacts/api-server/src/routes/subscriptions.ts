import { Router } from "express";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

const plans = [
  { id: "plan_free", name: "Free", price: 0, billing_cycle: "monthly", features: { video_consults: 0, lab_tests: 0, priority_appointments: 0, family_members: 1, health_locker_storage: "100 MB", dedicated_support: false }, active_subscribers: 8420 },
  { id: "plan_basic", name: "Basic", price: 1499, billing_cycle: "monthly", features: { video_consults: 4, lab_tests: 10, priority_appointments: 1, family_members: 2, health_locker_storage: "1 GB", dedicated_support: false }, active_subscribers: 2840 },
  { id: "plan_standard", name: "Standard", price: 2999, billing_cycle: "monthly", features: { video_consults: 10, lab_tests: 20, priority_appointments: 2, family_members: 3, health_locker_storage: "20 GB", dedicated_support: true }, active_subscribers: 960 },
  { id: "plan_family", name: "Family", price: 4999, billing_cycle: "monthly", features: { video_consults: "Unlimited", lab_tests: "Unlimited", priority_appointments: "Unlimited", family_members: "Up to 6", health_locker_storage: "50 GB", dedicated_support: true }, active_subscribers: 320 },
];

router.get("/subscriptions/plans", (_req, res) => res.json(plans));

router.get("/subscriptions/stats", (_req, res) => {
  const total = plans.reduce((s, p) => s + p.active_subscribers, 0);
  res.json({
    mrr: plans.reduce((s, p) => s + p.price * p.active_subscribers, 0),
    active_subscribers: total,
    churn_rate: 2.35,
    renewals_this_month: 1256,
    plan_distribution: plans.map(p => ({
      plan: p.name,
      count: p.active_subscribers,
      percentage: ((p.active_subscribers / total) * 100).toFixed(1),
    })),
  });
});

router.get("/subscriptions", (_req, res) => {
  res.json({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
});

export default router;
