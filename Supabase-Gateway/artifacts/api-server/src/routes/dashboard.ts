import { Router } from "express";

const router = Router();

router.get("/dashboard/stats", (req, res) => {
  res.json({
    total_users: 128540,
    total_users_change: 12.5,
    verified_doctors: 1845,
    verified_doctors_change: 8.4,
    todays_appointments: 1256,
    todays_appointments_change: 15.3,
    monthly_revenue: 24680000,
    monthly_revenue_change: 18.7,
    open_tickets: 186,
    pending_approvals: 5,
    payment_reconciliation: [
      { gateway: "JazzCash", amount: 12458700, change: 16.5 },
      { gateway: "Easypaisa", amount: 9236450, change: 14.3 },
      { gateway: "Raast", amount: 2985610, change: 9.8 },
    ],
  });
});

router.get("/dashboard/activity", (req, res) => {
  res.json([
    { id: "1", user: "Admin User", action: "Approved doctor verification for Dr. Ayesha Noor", entity: "Doctor", timestamp: "2025-05-22T11:40:00Z" },
    { id: "2", user: "Admin User", action: "Updated subscription plan for Dr. Usman Tariq", entity: "Subscription", timestamp: "2025-05-22T11:15:00Z" },
    { id: "3", user: "Admin User", action: "Refund processed via JazzCash for TXN #874512", entity: "Payment", timestamp: "2025-05-22T10:58:00Z" },
    { id: "4", user: "System", action: "Updated appointment status to Completed", entity: "Appointment", timestamp: "2025-05-22T10:30:00Z" },
    { id: "5", user: "Admin User", action: "Created support reply for ticket #TKT-84521", entity: "Support", timestamp: "2025-05-22T09:47:00Z" },
    { id: "6", user: "System", action: "User login from IP 103.111.XX.XX", entity: null, timestamp: "2025-05-22T09:20:00Z" },
  ]);
});

router.get("/dashboard/revenue-trend", (req, res) => {
  const data = [
    { date: "Apr 23", revenue: 780000 },
    { date: "Apr 30", revenue: 920000 },
    { date: "May 7", revenue: 1050000 },
    { date: "May 14", revenue: 1284500 },
    { date: "May 16", revenue: 1380000 },
    { date: "May 22", revenue: 1860000 },
  ];
  res.json(data);
});

router.get("/dashboard/verification-queue", (req, res) => {
  res.json([
    { id: "d1", name: "Dr. Ayesha Noor", specialty: "Gynecologist", city: "Lahore", status: "pending", avatar_url: null, joined_time_ago: "2h ago" },
    { id: "d2", name: "Dr. Usman Tariq", specialty: "Cardiologist", city: "Karachi", status: "pending", avatar_url: null, joined_time_ago: "4h ago" },
    { id: "d3", name: "Dr. Hina Fatima", specialty: "Gynecologist", city: "Islamabad", status: "pending", avatar_url: null, joined_time_ago: "6h ago" },
    { id: "d4", name: "Dr. Bilal Ahmad", specialty: "ENT Specialist", city: "Faisalabad", status: "pending", avatar_url: null, joined_time_ago: "8h ago" },
    { id: "d5", name: "Dr. Sarah Khan", specialty: "Pediatrician", city: "Peshawar", status: "pending", avatar_url: null, joined_time_ago: "10h ago" },
  ]);
});

export default router;
