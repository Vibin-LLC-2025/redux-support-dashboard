import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Lightweight request log so the API surface is visible while developing.
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const STATUSES = ["open", "pending", "resolved"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

// In-memory store. A real deployment would swap this for Postgres/Prisma;
// the route handlers and validation stay identical.
let nextId = 1;
const now = Date.UTC(2026, 6, 6, 15, 0, 0); // fixed base so seed ages are stable
const hoursAgo = (h) => new Date(now - h * 3600_000).toISOString();

let tickets = [
  { subject: "Checkout fails on Safari 17", requester: "Dana Ruiz", priority: "urgent", status: "open", assignee: "Priya N.", createdAt: hoursAgo(3) },
  { subject: "Export CSV missing tax column", requester: "Marcus Lee", priority: "high", status: "open", assignee: null, createdAt: hoursAgo(9) },
  { subject: "Dark mode contrast on alerts", requester: "Sofia Alvarez", priority: "medium", status: "pending", assignee: "Priya N.", createdAt: hoursAgo(26) },
  { subject: "SSO redirect loop for @acme.com", requester: "Tomás Vega", priority: "urgent", status: "pending", assignee: "Jordan K.", createdAt: hoursAgo(5) },
  { subject: "Typo in onboarding tooltip", requester: "Grace Kim", priority: "low", status: "resolved", assignee: "Jordan K.", createdAt: hoursAgo(52) },
  { subject: "Webhook retries firing twice", requester: "Owen Park", priority: "high", status: "open", assignee: "Priya N.", createdAt: hoursAgo(14) },
  { subject: "Invoice PDF wrong currency symbol", requester: "Lena Fischer", priority: "medium", status: "resolved", assignee: "Sam O.", createdAt: hoursAgo(71) },
  { subject: "Mobile nav traps keyboard focus", requester: "Ravi Menon", priority: "high", status: "pending", assignee: null, createdAt: hoursAgo(31) },
].map((t) => ({ id: nextId++, updatedAt: t.createdAt, ...t }));

// Simulate real network latency so the loading states are exercised.
const latency = (req, _res, next) => setTimeout(next, 250);

function validateNewTicket(body) {
  const errors = [];
  if (!body || typeof body.subject !== "string" || body.subject.trim().length < 3) {
    errors.push("subject is required (min 3 chars)");
  }
  if (body?.priority && !PRIORITIES.includes(body.priority)) {
    errors.push(`priority must be one of ${PRIORITIES.join(", ")}`);
  }
  return errors;
}

// GET /api/tickets — list all tickets
app.get("/api/tickets", latency, (_req, res) => {
  res.json(tickets);
});

// GET /api/tickets/:id — single ticket
app.get("/api/tickets/:id", (req, res) => {
  const ticket = tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket);
});

// POST /api/tickets — create a ticket
app.post("/api/tickets", latency, (req, res) => {
  const errors = validateNewTicket(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const ts = new Date().toISOString();
  const ticket = {
    id: nextId++,
    subject: req.body.subject.trim(),
    requester: req.body.requester?.trim() || "Anonymous",
    priority: req.body.priority || "medium",
    status: "open",
    assignee: req.body.assignee?.trim() || null,
    createdAt: ts,
    updatedAt: ts,
  };
  tickets.push(ticket);
  res.status(201).json(ticket);
});

// PATCH /api/tickets/:id — update status / priority / assignee
app.patch("/api/tickets/:id", latency, (req, res) => {
  const ticket = tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const { status, priority, assignee } = req.body;
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
  }
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(", ")}` });
  }

  if (status !== undefined) ticket.status = status;
  if (priority !== undefined) ticket.priority = priority;
  if (assignee !== undefined) ticket.assignee = assignee?.trim() || null;
  ticket.updatedAt = new Date().toISOString();
  res.json(ticket);
});

// DELETE /api/tickets/:id — remove a ticket
app.delete("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = tickets.some((t) => t.id === id);
  if (!exists) return res.status(404).json({ error: "Ticket not found" });
  tickets = tickets.filter((t) => t.id !== id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Support Desk API listening on http://localhost:${PORT}`);
});
