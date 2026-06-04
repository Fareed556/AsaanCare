import { Router } from "express";
import { paginate, parsePagination } from "../lib/pagination";

const router = Router();

const clinics = [
  { id: "c1", name: "Shaukat Khanum Cancer Hospital", phone: "042-35905000", address: "7-A, Block R-3, M.A. Johar Town", city: "Lahore", area: "Johar Town", status: "ACTIVE", doctors_count: 45, created_at: "2024-01-01T00:00:00Z" },
  { id: "c2", name: "Aga Khan University Hospital", phone: "021-34864864", address: "Stadium Road", city: "Karachi", area: "Stadium Road", status: "ACTIVE", doctors_count: 120, created_at: "2024-01-01T00:00:00Z" },
  { id: "c3", name: "PIMS Hospital", phone: "051-9261170", address: "G-8/3, Islamabad", city: "Islamabad", area: "G-8", status: "ACTIVE", doctors_count: 68, created_at: "2024-01-01T00:00:00Z" },
  { id: "c4", name: "Doctors Hospital", phone: "042-37479924", address: "152-G, Canal Bank Road", city: "Lahore", area: "Gulberg", status: "ACTIVE", doctors_count: 32, created_at: "2024-02-15T00:00:00Z" },
  { id: "c5", name: "Liaquat National Hospital", phone: "021-34412360", address: "Karachi National Highway", city: "Karachi", area: "Karachi East", status: "ACTIVE", doctors_count: 55, created_at: "2024-03-10T00:00:00Z" },
  { id: "c6", name: "Holy Family Hospital", phone: "051-9290301", address: "Satellite Town", city: "Rawalpindi", area: "Satellite Town", status: "ACTIVE", doctors_count: 40, created_at: "2024-01-20T00:00:00Z" },
  { id: "c7", name: "Hayatabad Medical Complex", phone: "091-9217381", address: "Phase 5, Hayatabad", city: "Peshawar", area: "Hayatabad", status: "INACTIVE", doctors_count: 28, created_at: "2024-04-05T00:00:00Z" },
];

router.get("/clinics", (req, res) => {
  let filtered = [...clinics];
  const q = req.query as Record<string, string>;
  if (q.status && q.status !== "all") filtered = filtered.filter(c => c.status === q.status);
  if (q.city) filtered = filtered.filter(c => c.city.toLowerCase().includes(q.city.toLowerCase()));
  if (q.search) filtered = filtered.filter(c => c.name.toLowerCase().includes(q.search.toLowerCase()));
  const result = paginate(filtered, parsePagination(q));
  res.json(result);
});

router.get("/clinics/:id", (req, res): void => {
  const clinic = clinics.find(c => c.id === req.params.id);
  if (!clinic) { res.status(404).json({ error: "Clinic not found" }); return; }
  res.json(clinic);
});

router.post("/clinics", (req, res) => {
  const newClinic = {
    id: `c${clinics.length + 1}`,
    ...req.body,
    status: "ACTIVE",
    doctors_count: 0,
    created_at: new Date().toISOString(),
  };
  clinics.push(newClinic);
  res.status(201).json(newClinic);
});

router.patch("/clinics/:id", (req, res): void => {
  const clinic = clinics.find(c => c.id === req.params.id);
  if (!clinic) { res.status(404).json({ error: "Clinic not found" }); return; }
  Object.assign(clinic, req.body);
  res.json(clinic);
});

router.delete("/clinics/:id", (req, res): void => {
  const idx = clinics.findIndex(c => c.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Clinic not found" }); return; }
  clinics.splice(idx, 1);
  res.status(204).send();
});

export default router;
