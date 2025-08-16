import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const ORDERS_API = "https://rpmourya-printbee.onrender.com/admin/orders";

function getAdminPwd() {
  return sessionStorage.getItem("adminPwd") || "";
}

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(ORDERS_API, {
        method: "GET",
        headers: { "x-admin-pwd": getAdminPwd() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) setOrders(data.orders);
      else setOrders([]);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading)
    return <p className="text-gray-500 text-center mt-6">Loading analytics...</p>;
  if (!orders.length)
    return <p className="text-gray-500 text-center mt-6">No analytics data available.</p>;

  // Prepare chart data
  const byMonth = {};
  const byPayment = {};
  const revenueByMonth = {};

  orders.forEach((o) => {
    const month = (o.timestamp || "").slice(0, 7) || "Unknown";
    byMonth[month] = (byMonth[month] || 0) + 1;
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(o.price || 0);
    const payMethod = o.paymentMethod || "Unknown";
    byPayment[payMethod] = (byPayment[payMethod] || 0) + 1;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Orders per Month */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Orders per Month</h3>
          <Bar
            data={{
              labels: Object.keys(byMonth),
              datasets: [
                { label: "Orders", data: Object.values(byMonth), backgroundColor: "#3b82f6" },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: "top" } } }}
          />
        </div>

        {/* Revenue per Month */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Revenue per Month</h3>
          <Line
            data={{
              labels: Object.keys(revenueByMonth),
              datasets: [
                {
                  label: "Revenue (₹)",
                  data: Object.values(revenueByMonth),
                  borderColor: "#10b981",
                  backgroundColor: "#6ee7b7",
                  tension: 0.3,
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: "top" } } }}
          />
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Payment Method Distribution</h3>
          <Pie
            data={{
              labels: Object.keys(byPayment),
              datasets: [
                {
                  data: Object.values(byPayment),
                  backgroundColor: ["#f97316", "#3b82f6", "#ef4444", "#10b981", "#a855f7"],
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: "right" } } }}
          />
        </div>
      </div>
    </div>
  );
}
