/**********************************************
 * Node.js Express Backend for Google Apps Script Integration (Updated)
 **********************************************/

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Node <18
require("dotenv").config();

const app = express();
const PORT = 5000;
const GAS_URL = "https://script.google.com/macros/s/AKfycbzh1Ql8BNzP78-FAnRad2eVo8BcXr_q3iDZ3TbCqCHLXkmd5VeiMBv2_Vfe-YVuf7v0/exec";

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-pwd"],
  })
);
app.use(express.json({ limit: "110mb" }));

// Admin Auth
function checkAdmin(req, res, next) {
  const pwd = req.headers["x-admin-pwd"];
  if (!pwd || pwd !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  next();
}

/* =======================
   Public Order Creation
======================= */
app.post("/order", async (req, res) => {
  try {
    const orderData = { action: "create", ...req.body };
    const gasRes = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    const data = await gasRes.json();
    res.json({ success: true, ...data });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =======================
   Admin Login
======================= */
app.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ success: false, error: "Unauthorized" });
});

/* =======================
   Admin Orders
======================= */
app.get("/admin/orders", checkAdmin, async (req, res) => {
  try {
    const gasRes = await fetch(`${GAS_URL}?action=getOrders`);
    const data = await gasRes.json();
    const orders = Array.isArray(data.orders) ? data.orders : [];
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Orders fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =======================
   Admin Dashboard
======================= */
app.get("/admin/dashboard", checkAdmin, async (req, res) => {
  try {
    const statsRes = await fetch(`${GAS_URL}?action=getDashboardStats`);
    const statsData = await statsRes.json();

    const ordersRes = await fetch(`${GAS_URL}?action=getOrders`);
    const ordersData = await ordersRes.json();
    const orders = Array.isArray(ordersData.orders) ? ordersData.orders : [];

    res.json({
      success: true,
      stats: statsData.stats || {
        totalOrders: statsData.totalOrders || 0,
        todayOrders: statsData.todayOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
        todayRevenue: statsData.todayRevenue || 0,
      },
      orders: orders.reverse(),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, error: "Failed to load dashboard" });
  }
});

/* =======================
   Admin Analytics
======================= */
app.get("/admin/analytics", checkAdmin, async (req, res) => {
  try {
    const gasRes = await fetch(`${GAS_URL}?action=getAnalytics`);
    const data = await gasRes.json();
    res.json({ success: true, ...data });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =======================
   Admin Create Custom Order
======================= */
app.post("/admin/create-order", checkAdmin, async (req, res) => {
  try {
    const body = { action: "create", ...req.body };
    const gasRes = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await gasRes.json();
    res.json({ success: true, ...data });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

/* =======================
   Admin Update Order
======================= */
app.post("/admin/update-order", checkAdmin, async (req, res) => {
  try {
    const { orderId, jobStatus, price } = req.body;

    // Forward to GAS with action included
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", orderId, jobStatus, price }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(400).json({ success: false, error: data.error || "GAS update failed" });
    }

    res.json({ success: true, message: "Order updated successfully" });
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ success: false, error: "Server error while updating order" });
  }
});



/* =======================
   Test Route
======================= */
app.get("/data", (req, res) => {
  res.json({ message: "Hello, World!" });
});

/* =======================
   Start Server
======================= */
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
