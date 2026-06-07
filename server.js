const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Queue donasi - simpan donasi yang belum di-fetch Roblox
let donationQueue = [];

// ============================================
// WEBHOOK ENDPOINTS (terima donasi dari platform)
// ============================================

// Saweria Webhook
app.post("/webhook/saweria", (req, res) => {
  const data = req.body;
  const donation = {
    platform: "saweria",
    name: data.donator_name || data.name || "Anonim",
    amount: data.amount || 0,
    message: data.message || "",
    timestamp: Date.now(),
  };
  donationQueue.push(donation);
  console.log(`[Saweria] ${donation.name} - Rp${donation.amount}: ${donation.message}`);
  res.status(200).json({ success: true });
});

// Sociabuzz Webhook
app.post("/webhook/sociabuzz", (req, res) => {
  const data = req.body;
  const donation = {
    platform: "sociabuzz",
    name: data.fan_name || data.name || "Anonim",
    amount: data.amount || data.total || 0,
    message: data.message || data.note || "",
    timestamp: Date.now(),
  };
  donationQueue.push(donation);
  console.log(`[Sociabuzz] ${donation.name} - Rp${donation.amount}: ${donation.message}`);
  res.status(200).json({ success: true });
});

// Bagibagi Webhook
app.post("/webhook/bagibagi", (req, res) => {
  const data = req.body;
  const donation = {
    platform: "bagibagi",
    name: data.supporter_name || data.name || "Anonim",
    amount: data.amount || 0,
    message: data.message || "",
    timestamp: Date.now(),
  };
  donationQueue.push(donation);
  console.log(`[Bagibagi] ${donation.name} - Rp${donation.amount}: ${donation.message}`);
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
  const { name, amount, message } = req.body;
  donationQueue.push({
    platform: "test",
    name: name || "Tester",
    amount: amount || 10000,
    message: message || "Test donasi!",
    timestamp: Date.now(),
  });
  res.json({ success: true, queue_size: donationQueue.length });
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
