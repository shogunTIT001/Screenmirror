// Simple Discovery Server for Screen Share
// - Hosts can POST /announce with { id, name, ips[] }
// - Viewers can GET /hosts to list currently announced hosts
// - In-memory registry with TTL (default 2 minutes)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TTL_MS = 2 * 60 * 1000; // 2 minutes

// In-memory registry: id -> { id, name, ips, ts, expires }
const hosts = new Map();

function prune() {
  const now = Date.now();
  for (const [id, v] of hosts.entries()) {
    if (v.expires <= now) hosts.delete(id);
  }
}
setInterval(prune, 60 * 1000);

app.get('/status', (req, res) => res.json({ ok: true, hosts: hosts.size }));

// Announce or renew
app.post('/announce', (req, res) => {
  const { id, name, ips } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  const now = Date.now();
  hosts.set(id, { id, name: name || id, ips: ips || [], ts: now, expires: now + TTL_MS });
  res.json({ ok: true });
});

// Remove announcement
app.post('/remove', (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  hosts.delete(id);
  res.json({ ok: true });
});

// List hosts
app.get('/hosts', (req, res) => {
  prune();
  const arr = Array.from(hosts.values()).map(h => ({ id: h.id, name: h.name, ips: h.ips, ts: h.ts }));
  res.json(arr);
});

app.listen(PORT, () => console.log(`Discovery server running on http://localhost:${PORT}`));
