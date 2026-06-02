import { Router } from "express";

const router = Router();

const doctors = [
  { id: "d1", name: "Dr. Ayesha Noor", specialty: "Cardiology", city: "Lahore", pmdc_number: "79484-P", status: "verified", joined_date: "2025-05-18", avatar_url: null, rating: 4.8, appointments_completed: 156, no_shows: 12, avg_response_time: "18 mins", featured: true, fee: 1500 },
  { id: "d2", name: "Dr. Usman Tariq", specialty: "General Medicine", city: "Karachi", pmdc_number: "454321-P", status: "pending", joined_date: "2025-05-20", avatar_url: null, rating: null, appointments_completed: 0, no_shows: 0, avg_response_time: null, featured: false, fee: 800 },
  { id: "d3", name: "Dr. Hina Fatima", specialty: "Dermatology", city: "Islamabad", pmdc_number: "112233-P", status: "pending", joined_date: "2025-05-21", avatar_url: null, rating: null, appointments_completed: 0, no_shows: 0, avg_response_time: null, featured: false, fee: 1200 },
  { id: "d4", name: "Dr. Bilal Ahmad", specialty: "Orthopedics", city: "Rawalpindi", pmdc_number: "334400-P", status: "verified", joined_date: "2025-05-17", avatar_url: null, rating: 4.6, appointments_completed: 89, no_shows: 5, avg_response_time: "22 mins", featured: false, fee: 2000 },
  { id: "d5", name: "Dr. Sana Khan", specialty: "Pediatrics", city: "Multan", pmdc_number: "556677-P", status: "verified", joined_date: "2025-05-15", avatar_url: null, rating: 4.7, appointments_completed: 203, no_shows: 8, avg_response_time: "15 mins", featured: true, fee: 1000 },
  { id: "d6", name: "Dr. Farhan Malik", specialty: "ENT", city: "Peshawar", pmdc_number: "667788-P", status: "verified", joined_date: "2025-05-12", avatar_url: null, rating: 4.5, appointments_completed: 134, no_shows: 15, avg_response_time: "25 mins", featured: false, fee: 1300 },
  { id: "d7", name: "Dr. Maryam Siddiqui", specialty: "Gynecology", city: "Lahore", pmdc_number: "778899-P", status: "suspended", joined_date: "2025-05-10", avatar_url: null, rating: 3.2, appointments_completed: 45, no_shows: 22, avg_response_time: "45 mins", featured: false, fee: 1500 },
  { id: "d8", name: "Dr. Hassan Malik", specialty: "Neurology", city: "Karachi", pmdc_number: "889900-P", status: "pending", joined_date: "2025-05-21", avatar_url: null, rating: null, appointments_completed: 0, no_shows: 0, avg_response_time: null, featured: false, fee: 2500 },
  { id: "d9", name: "Dr. Faisal Mahmood", specialty: "General Medicine", city: "Lahore", pmdc_number: "990011-P", status: "verified", joined_date: "2025-05-08", avatar_url: null, rating: 4.9, appointments_completed: 312, no_shows: 3, avg_response_time: "12 mins", featured: true, fee: 900 },
  { id: "d10", name: "Dr. Fatima Noor", specialty: "Psychiatry", city: "Islamabad", pmdc_number: "112244-P", status: "verified", joined_date: "2025-05-14", avatar_url: null, rating: 4.7, appointments_completed: 178, no_shows: 9, avg_response_time: "20 mins", featured: false, fee: 1800 },
];

router.get("/doctors", (req, res) => {
  let filtered = [...doctors];
  const { status, specialty, city, search, page = "1", limit = "10" } = req.query as Record<string, string>;

  if (status && status !== "all") filtered = filtered.filter(d => d.status === status);
  if (specialty) filtered = filtered.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
  if (city) filtered = filtered.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
  if (search) filtered = filtered.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.pmdc_number.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = filtered.length;
  const data = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

router.get("/doctors/stats", (req, res) => {
  res.json({
    total: 1845,
    verified: 1256,
    pending: 412,
    suspended: 177,
  });
});

router.get("/doctors/:id", (req, res): void => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
  res.json(doctor);
});

router.patch("/doctors/:id", (req, res): void => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
  Object.assign(doctor, req.body);
  res.json(doctor);
});

router.patch("/doctors/:id/status", (req, res): void => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
  doctor.status = req.body.status;
  res.json(doctor);
});

router.post("/doctors", (req, res) => {
  const newDoctor = {
    id: `d${doctors.length + 1}`,
    ...req.body,
    status: "pending",
    joined_date: new Date().toISOString().split("T")[0],
    rating: null,
    appointments_completed: 0,
    no_shows: 0,
    avg_response_time: null,
    featured: false,
    avatar_url: null,
  };
  doctors.push(newDoctor);
  res.status(201).json(newDoctor);
});

export default router;
