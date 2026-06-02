import { Router } from "express";

const router = Router();

const adminUsers = [
  { id: "au1", name: "Ayesha Malik", email: "ayesha.malik@sahatghar.pk", role: "Super Admin", status: "active", last_active: "2025-05-22T11:30:00Z", avatar_url: null, failed_attempts: 0 },
  { id: "au2", name: "Usman Khan", email: "usman.khan@sahatghar.pk", role: "Admin", status: "active", last_active: "2025-05-22T11:10:00Z", avatar_url: null, failed_attempts: 0 },
  { id: "au3", name: "Sana Iman", email: "sana.iman@sahatghar.pk", role: "Finance", status: "active", last_active: "2025-05-22T09:05:00Z", avatar_url: null, failed_attempts: 0 },
  { id: "au4", name: "Bilal Ahmed", email: "bilal.ahmed@sahatghar.pk", role: "Doctor Verifier", status: "suspended", last_active: "2025-05-04T11:40:00Z", avatar_url: null, failed_attempts: 3 },
];

router.get("/admin-users", (req, res) => {
  res.json(adminUsers);
});

router.post("/admin-users", (req, res) => {
  const newUser = {
    id: `au${adminUsers.length + 1}`,
    ...req.body,
    status: "active",
    last_active: new Date().toISOString(),
    avatar_url: null,
    failed_attempts: 0,
  };
  adminUsers.push(newUser);
  res.status(201).json(newUser);
});

router.patch("/admin-users/:id/status", (req, res): void => {
  const user = adminUsers.find(u => u.id === req.params.id);
  if (!user) { res.status(404).json({ error: "Admin user not found" }); return; }
  user.status = req.body.status;
  res.json(user);
});

export default router;
