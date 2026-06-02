import { Router } from "express";

const router = Router();

const appointments = [
  { id: "apt1", patient_name: "Ayesha Khan", patient_age: 28, patient_gender: "Female", doctor_name: "Dr. Hina Fatima", doctor_specialty: "Gynecologist", date_time: "2025-05-22T11:00:00Z", type: "Video Consultation", city: "Lahore", status: "confirmed", amount: 1500, payment_method: "JazzCash", payment_status: "paid", notes: null },
  { id: "apt2", patient_name: "Ali Raza", patient_age: 35, patient_gender: "Male", doctor_name: "Dr. Faisal Mahmood", doctor_specialty: "General Physician", date_time: "2025-05-22T09:30:00Z", type: "Video Consultation", city: "Karachi", status: "completed", amount: 900, payment_method: "Easypaisa", payment_status: "paid", notes: null },
  { id: "apt3", patient_name: "Sana Imran", patient_age: 32, patient_gender: "Female", doctor_name: "Dr. Usman Javed", doctor_specialty: "ENT Specialist", date_time: "2025-05-22T09:00:00Z", type: "Audio Consultation", city: "Islamabad", status: "no-show", amount: 800, payment_method: "JazzCash", payment_status: "paid", notes: "Patient did not join" },
  { id: "apt4", patient_name: "Hamza Hassan", patient_age: 45, patient_gender: "Male", doctor_name: "Dr. Maryam Siddiqui", doctor_specialty: "Gynecologist", date_time: "2025-05-21T21:00:00Z", type: "Video Consultation", city: "Lahore", status: "cancelled", amount: 1200, payment_method: "Raast", payment_status: "refunded", notes: "Doctor unavailable" },
  { id: "apt5", patient_name: "Zainab Malik", patient_age: 27, patient_gender: "Female", doctor_name: "Dr. Bilal Ahmad", doctor_specialty: "Dermatologist", date_time: "2025-05-21T18:00:00Z", type: "Video Consultation", city: "Karachi", status: "completed", amount: 2000, payment_method: "JazzCash", payment_status: "paid", notes: null },
  { id: "apt6", patient_name: "Ahmed Sheikh", patient_age: 52, patient_gender: "Male", doctor_name: "Dr. Sarah Khan", doctor_specialty: "Psychiatrist", date_time: "2025-05-21T16:00:00Z", type: "Audio Consultation", city: "Rawalpindi", status: "completed", amount: 1800, payment_method: "Easypaisa", payment_status: "paid", notes: null },
  { id: "apt7", patient_name: "Fatima Noor", patient_age: 38, patient_gender: "Female", doctor_name: "Dr. Ayesha Noor", doctor_specialty: "Cardiologist", date_time: "2025-05-21T14:30:00Z", type: "Video Consultation", city: "Lahore", status: "disputed", amount: 1500, payment_method: "JazzCash", payment_status: "paid", notes: "Patient complaint: Doctor was late" },
  { id: "apt8", patient_name: "Mohsin Tariq", patient_age: 41, patient_gender: "Male", doctor_name: "Dr. Usman Javed", doctor_specialty: "ENT Specialist", date_time: "2025-05-21T12:00:00Z", type: "Audio Consultation", city: "Multan", status: "completed", amount: 800, payment_method: "Raast", payment_status: "paid", notes: null },
];

router.get("/appointments", (req, res) => {
  let filtered = [...appointments];
  const { status, doctor_id, patient_id, city, type, page = "1", limit = "10" } = req.query as Record<string, string>;

  if (status && status !== "all") filtered = filtered.filter(a => a.status === status);
  if (city) filtered = filtered.filter(a => a.city.toLowerCase().includes(city.toLowerCase()));
  if (type) filtered = filtered.filter(a => a.type.toLowerCase().includes(type.toLowerCase()));

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = filtered.length;
  const data = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

router.get("/appointments/stats", (req, res) => {
  res.json({
    total: 1256,
    attended: 904,
    no_show: 206,
    cancelled: 146,
    completion_rate: 72.4,
    by_doctor: [
      { doctor_name: "Dr. Faisal Mahmood", completion_rate: 84.2 },
      { doctor_name: "Dr. Ayesha Noor", completion_rate: 78.8 },
      { doctor_name: "Dr. Hina Fatima", completion_rate: 72.1 },
      { doctor_name: "Dr. Usman Javed", completion_rate: 68.3 },
      { doctor_name: "Dr. Bilal Ahmad", completion_rate: 46.7 },
    ],
    by_city: [
      { city: "Lahore", completion_rate: 75.4 },
      { city: "Karachi", completion_rate: 71.6 },
      { city: "Islamabad", completion_rate: 70.8 },
      { city: "Rawalpindi", completion_rate: 70.4 },
      { city: "Multan", completion_rate: 49.2 },
      { city: "Peshawar", completion_rate: 46.7 },
    ],
  });
});

router.get("/appointments/:id", (req, res): void => {
  const appointment = appointments.find(a => a.id === req.params.id);
  if (!appointment) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(appointment);
});

router.patch("/appointments/:id", (req, res): void => {
  const appointment = appointments.find(a => a.id === req.params.id);
  if (!appointment) { res.status(404).json({ error: "Appointment not found" }); return; }
  Object.assign(appointment, req.body);
  res.json(appointment);
});

export default router;
