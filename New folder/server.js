/**
 * Sagar Dental Clinic — Backend Server
 * Node.js + Express
 *
 * Routes:
 *   GET  /            → serves the website
 *   POST /api/appointment → saves appointment + (optionally) sends WhatsApp/SMS
 */

const express  = require('express');
const path     = require('path');
const fs       = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── DATA STORE (JSON file — swap for a real DB in production) ──
const DB_FILE = path.join(__dirname, 'data', 'appointments.json');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
}

function readAppointments() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeAppointments(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ── ROUTES ──────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', clinic: 'Sagar Dental' }));

// Book appointment
app.post('/api/appointment', (req, res) => {
  const { name, phone, service, message } = req.body;

  // Validate
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }
  const cleanPhone = phone.replace(/\s/g, '');
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }

  const appointment = {
    id:        Date.now(),
    name:      name.trim(),
    phone:     cleanPhone,
    service:   service || 'Not specified',
    message:   message || '',
    status:    'pending',
    createdAt: new Date().toISOString()
  };

  // Save to file
  const all = readAppointments();
  all.push(appointment);
  writeAppointments(all);

  console.log(`[APPOINTMENT] ${appointment.name} | ${appointment.phone} | ${appointment.service}`);

  // ── Optional: Send WhatsApp via Twilio (uncomment + add credentials) ──
  // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
  // twilio.messages.create({
  //   from: 'whatsapp:+14155238886',
  //   to:   `whatsapp:+91${cleanPhone}`,
  //   body: `Hi ${name}! Your appointment request at Sagar Dental Clinic has been received. We'll call you shortly to confirm. — Dr. Sagar (095849 53537)`
  // });

  res.status(201).json({ success: true, id: appointment.id });
});

// Admin: list all appointments (protect this in production!)
app.get('/api/appointments', (_req, res) => {
  const all = readAppointments();
  res.json({ total: all.length, appointments: all.reverse() });
});

// Update appointment status
app.patch('/api/appointment/:id', (req, res) => {
  const id  = parseInt(req.params.id);
  const { status } = req.body;
  const all = readAppointments();
  const idx = all.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found.' });
  all[idx].status = status;
  writeAppointments(all);
  res.json({ success: true, appointment: all[idx] });
});

// Serve index for all other routes (SPA fallback)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🦷 Sagar Dental Clinic server running`);
  console.log(`   → http://localhost:${PORT}\n`);
});

module.exports = app;
