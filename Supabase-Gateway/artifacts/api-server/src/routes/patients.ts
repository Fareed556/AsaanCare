import { Router } from "express";

const router = Router();

const patients = [
  { id: "p1", name: "Ayesha Khan", phone: "0321-1234567", email: "ayesha.khan@gmail.com", city: "Lahore", status: "active", joined_date: "2025-01-12", avatar_url: null, total_bookings: 24, total_spent: 18450, upcoming_bookings: 2 },
  { id: "p2", name: "Muhammad Ali", phone: "0300-9876543", email: "m.ali@gmail.com", city: "Karachi", status: "active", joined_date: "2025-02-05", avatar_url: null, total_bookings: 17, total_spent: 12300, upcoming_bookings: 1 },
  { id: "p3", name: "Fatima Noor", phone: "0315-7634321", email: "fatima@gmail.com", city: "Islamabad", status: "active", joined_date: "2025-03-18", avatar_url: null, total_bookings: 9, total_spent: 6500, upcoming_bookings: 0 },
  { id: "p4", name: "Usman Javed", phone: "0333-2346678", email: "usman.j@gmail.com", city: "Rawalpindi", status: "active", joined_date: "2025-02-01", avatar_url: null, total_bookings: 33, total_spent: 24100, upcoming_bookings: 3 },
  { id: "p5", name: "Zainab Hassan", phone: "0322-8756342", email: "zainab@gmail.com", city: "Multan", status: "blocked", joined_date: "2025-01-21", avatar_url: null, total_bookings: 4, total_spent: 2800, upcoming_bookings: 0 },
  { id: "p6", name: "Bilal Ahmed", phone: "0308-1112233", email: "bilal@gmail.com", city: "Peshawar", status: "active", joined_date: "2025-04-30", avatar_url: null, total_bookings: 6, total_spent: 4200, upcoming_bookings: 1 },
  { id: "p7", name: "Sara Malik", phone: "0312-5674321", email: "sara.malik@gmail.com", city: "Lahore", status: "active", joined_date: "2025-03-10", avatar_url: null, total_bookings: 11, total_spent: 8900, upcoming_bookings: 0 },
  { id: "p8", name: "Hamza Hassan", phone: "0321-9987654", email: "hamza@gmail.com", city: "Karachi", status: "active", joined_date: "2025-02-28", avatar_url: null, total_bookings: 8, total_spent: 5600, upcoming_bookings: 2 },
];

router.get("/patients", (req, res) => {
  let filtered = [...patients];
  const { status, city, search, page = "1", limit = "10" } = req.query as Record<string, string>;

  if (status && status !== "all") filtered = filtered.filter(p => p.status === status);
  if (city) filtered = filtered.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
  if (search) filtered = filtered.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = filtered.length;
  const data = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

router.get("/patients/:id", (req, res): void => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(patient);
});

router.patch("/patients/:id", (req, res): void => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  Object.assign(patient, req.body);
  res.json(patient);
});

router.patch("/patients/:id/block", (req, res): void => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  patient.status = req.body.blocked ? "blocked" : "active";
  res.json(patient);
});

export default router;
