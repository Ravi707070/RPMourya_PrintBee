import React, { useEffect, useState } from "react";

const API = "http://localhost:5000"; // must match your backend

function getAdminPwd() {
  return sessionStorage.getItem("adminPwd") || "";
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    fetch(`${API}/dashboard?action=getDashboardStats&adminPwd=${getAdminPwd()}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load dashboard:", err));

    fetch(`${API}/dashboard?action=getAllOrders&adminPwd=${getAdminPwd()}`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Failed to load orders:", err));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Today Orders</h2>
          <p className="text-2xl font-bold text-green-600">{stats.todayOrders}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Pending Orders</h2>
          <p className="text-2xl font-bold text-red-600">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* All Orders Section */}
      <h2 className="text-xl font-bold mb-4">All Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>
                  <span className="font-semibold">Name:</span> {order.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {order.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {order.phone}
                </p>
                <p>
                  <span className="font-semibold">Pickup Time:</span>{" "}
                  {order.pickupTime}
                </p>
                <p className="md:col-span-2">
                  <span className="font-semibold">Description:</span>{" "}
                  {order.description}
                </p>
                <p>
                  <span className="font-semibold">Payment Method:</span>{" "}
                  {order.paymentMethod}
                </p>
                <p>
                  <span className="font-semibold">Price:</span> ₹{order.price}
                </p>
              </div>

              {/* File Links */}
              <div className="mt-3">
                <span className="font-semibold">Files:</span>
                {order.fileLink ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.fileLink.split(",").map((link, i) => (
                      <a
                        key={i}
                        href={link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Download {i + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No file available for this order.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
