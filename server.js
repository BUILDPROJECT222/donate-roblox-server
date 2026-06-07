const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Queue donasi - simpan donasi yang belum di-fetch Roblox
let donationQueue = [];

// Leaderboard - akumulasi total donasi per roblox_username
let leaderboard = {};

function updateLeaderboard(donation) {
  const username = donation.roblox_username;
  if (!username) return;
  if (!leaderboard[username]) {
    leaderboard[username] = { roblox_username: username, name: donation.name, total: 0 };
  }
  leaderboard[username].total += donation.amount || 0;
}

// ============================================
// WEBHOOK ENDPOINTS (terima donasi dari platform)
// ============================================

// Saweria Webhook
app.post("/webhook/saweria", (req, res) => {
  const data = req.body;
  const donation = {
    platform: "saweria",
    name: data.donator_name || data.name || "Anonim",
    roblox_username: data.roblox_username || "",
    amount: data.amount || 0,
    message: data.message || "",
    timestamp: Date.now(),
  };
  donationQueue.push(donation);
  updateLeaderboard(donation);
  console.log(`[Saweria] ${donation.name} (@${donation.roblox_username}) - Rp${donation.amount}: ${donation.message}`);
  res.status(200).json({ success: true });
});

// Sociabuzz Webhook
app.post("/webhook/sociabuzz", (req, res) => {
  const data = req.body;
  const donation = {
    platform: "sociabuzz",
    name: data.fan_name || data.name || "Anonim",
    roblox_username: data.roblox_username || "",
    amount: data.amount || data.total || 0,
    message: data.message || data.note || "",
    timestamp: Date.now(),
  };
  donationQueue.push(donation);
  updateLeaderboard(donation);
  console.log(`[Sociabuzz] ${donation.name} (@${donation.roblox_username}) - Rp${donation.amount}: ${donation.message}`);
  res.status(200).json({ success: true });
});

// Bagibagi Webhook
app.post("/webhook/bagibagi", (req, res) => {
  const data = req.body;
  const donation = {
    platform: "bagibagi",
    name: data.supporter_name || data.name || "Anonim",
    roblox_username: data.roblox_username || "",
    amount: data.amount || 0,
    message: data.message || "",
    timestamp: Date.now(),
  };
  donationQueue.push(donation);
  updateLeaderboard(donation);
  console.log(`[Bagibagi] ${donation.name} (@${donation.roblox_username}) - Rp${donation.amount}: ${donation.message}`);
  res.status(200).json({ success: true });
});

// ============================================
// ROBLOX POLLING ENDPOINT
// ============================================

// Roblox poll ini tiap 3-5 detik
// Mengembalikan semua donasi baru lalu mengosongkan queue
app.get("/donations/latest", (req, res) => {
  const donations = [...donationQueue];
  donationQueue = [];
  res.json({ donations });
});

// ============================================
// TEST ENDPOINT (untuk testing tanpa platform donasi)
// ============================================

app.post("/test/donate", (req, res) => {
  const { name, roblox_username, amount, message } = req.body;
  donationQueue.push({
    platform: "test",
    name: name || "Tester",
    roblox_username: roblox_username || "",
    amount: amount || 10000,
    message: message || "Test donasi!",
    timestamp: Date.now(),
  });
  updateLeaderboard(donationQueue[donationQueue.length - 1]);
  res.json({ success: true, queue_size: donationQueue.length });
});

// Leaderboard endpoint - top 20 donatur
app.get("/leaderboard", (req, res) => {
  const sorted = Object.values(leaderboard)
    .sort((a, b) => b.total - a.total)
    .slice(0, 20)
    .map((entry, i) => ({
      rank: i + 1,
      roblox_username: entry.roblox_username,
      name: entry.name,
      total: entry.total,
    }));
  res.json({ leaderboard: sorted });
});

// Manual set leaderboard (untuk import data awal)
app.post("/leaderboard/set", (req, res) => {
  const { entries } = req.body;
  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: "entries array required" });
  }
  leaderboard = {};
  for (const entry of entries) {
    if (entry.roblox_username) {
      leaderboard[entry.roblox_username] = {
        roblox_username: entry.roblox_username,
        name: entry.name || entry.roblox_username,
        total: entry.total || 0,
      };
    }
  }
  res.json({ success: true, count: Object.keys(leaderboard).length });
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "running",
    queue_size: donationQueue.length,
    endpoints: {
      webhooks: ["POST /webhook/saweria", "POST /webhook/sociabuzz", "POST /webhook/bagibagi"],
      roblox: "GET /donations/latest",
      test: "POST /test/donate",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server donasi berjalan di port ${PORT}`);
  console.log(`Roblox poll: GET http://localhost:${PORT}/donations/latest`);
});
