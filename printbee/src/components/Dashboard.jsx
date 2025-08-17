import React, { useEffect, useState } from "react";

const API = "https://rpmourya-printbee.onrender.com";

function getAdminPwd() {
  return sessionStorage.getItem("adminPwd") || "";
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [savingOrderIds, setSavingOrderIds] = useState([]);
  const [newOrder, setNewOrder] = useState({
    name: "",
    email: "",
    phone: "",
    pickupTime: "",
    description: "",
    paymentMethod: "",
    price: "",
  });

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Load stats + orders
  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/dashboard`, {
        headers: { "x-admin-pwd": getAdminPwd() },
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();

      setStats({
        totalOrders: Number(data.stats?.totalOrders || 0),
        todayOrders: Number(data.stats?.todayOrders || 0),
        totalRevenue: Number(data.stats?.totalRevenue || 0),
        todayRevenue: Number(data.stats?.todayRevenue || 0),
      });

      setOrders(Array.isArray(data.orders) ? data.orders.reverse() : []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.jobStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Download file(s)
  function downloadOrderFiles(order) {
    let files = [];

    if (Array.isArray(order.files) && order.files.length > 0) {
      files = order.files;
    } else if (order.fileUrl) {
      files = order.fileUrl.split(",").map((f) => f.trim());
    }

    if (files.length > 0) {
      files.forEach((fileUrl) => window.open(fileUrl, "_blank"));
    } else {
      alert("No file available for this order.");
    }
  }

  // Update price
  function handlePriceChange(index, value) {
    const updatedOrders = [...orders];
    updatedOrders[index].price = value === "" ? "" : Number(value);
    setOrders(updatedOrders);
  }

  // Update status
  function handleStatusChange(index, value) {
    const validStatuses = ["Pending", "In Progress", "Finished"];
    if (!validStatuses.includes(value)) return;
    const updatedOrders = [...orders];
    updatedOrders[index].jobStatus = value;
    setOrders(updatedOrders);
  }

  // Save order changes
  async function saveOrderChanges(order) {
    if (order.price === "" || Number(order.price) < 0) {
      return alert("Price must be a valid number >= 0");
    }

    const validStatuses = ["Pending", "In Progress", "Finished"];
    if (!validStatuses.includes(order.jobStatus)) {
      return alert("Job status must be Pending, In Progress, or Finished");
    }

    setSavingOrderIds((prev) => [...prev, order.orderId]);

    try {
      const res = await fetch(`${API}/admin/update-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pwd": getAdminPwd(),
        },
        body: JSON.stringify({
          orderId: order.orderId,
          jobStatus: order.jobStatus,
          price: Number(order.price),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Order updated successfully!");
        await load();
      } else {
        alert("Failed to update order: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order");
    } finally {
      setSavingOrderIds((prev) => prev.filter((id) => id !== order.orderId));
    }
  }

  // Create new order
  async function handleCustomOrder(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/admin/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pwd": getAdminPwd(),
        },
        body: JSON.stringify(newOrder),
      });

      if (!res.ok) throw new Error("Failed to create custom order");

      const data = await res.json();
      if (data.success) {
        setOrders((prev) => [
          { ...newOrder, orderId: data.orderId, jobStatus: "Pending" },
          ...prev,
        ]);

        setNewOrder({
          name: "",
          email: "",
          phone: "",
          pickupTime: "",
          description: "",
          paymentMethod: "",
          price: "",
        });

        alert("Custom order created successfully!");
      } else {
        alert("Failed to create order: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error creating custom order:", err);
      alert("Failed to create order");
    }
  }

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">📊 Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-4 bg-blue-100 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Total Orders</h2>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="p-4 bg-green-100 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Today Orders</h2>
          <p className="text-2xl font-bold">{stats.todayOrders}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Total Revenue</h2>
          <p className="text-2xl font-bold">₹{stats.totalRevenue}</p>
        </div>
        <div className="p-4 bg-purple-100 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Today Revenue</h2>
          <p className="text-2xl font-bold">₹{stats.todayRevenue}</p>
        </div>
      </div>

      {/* Search + Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full md:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded w-full md:w-1/4"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Finished">Finished</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">📦 All Orders</h2>
        {filteredOrders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-800">
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border text-left">Email</th>
                  <th className="p-3 border text-left">Phone</th>
                  <th className="p-3 border text-left">Pickup Time</th>
                  <th className="p-3 border text-left">Description</th>
                  <th className="p-3 border text-left">Files</th>
                  <th className="p-3 border text-right">Price</th>
                  <th className="p-3 border text-left">Status</th>
                  <th className="p-3 border text-left">Payment</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => {
                  let files = [];
                  if (Array.isArray(order.files) && order.files.length > 0) {
                    files = order.files;
                  } else if (order.fileUrl) {
                    files = order.fileUrl.split(",").map((f) => f.trim());
                  }

                  return (
                    <tr
                      key={order.orderId || i}
                      className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                    >
                      <td className="border p-2">{order.name}</td>
                      <td className="border p-2">{order.email}</td>
                      <td className="border p-2">{order.phone}</td>
                      <td className="border p-2">{order.pickupTime}</td>
                      <td className="border p-2">{order.description}</td>

                      <td className="border p-2">
                        {files.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {files.map((file, idx) => (
                              <li key={idx}>
                                <a
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  File {idx + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "No files"
                        )}
                      </td>

                      <td className="border p-2 text-right">
                        <input
                          type="number"
                          value={order.price || 0}
                          onChange={(e) =>
                            handlePriceChange(i, e.target.value)
                          }
                          className="w-20 border rounded p-1 text-right"
                        />
                      </td>

                      <td className="border p-2">
                        <select
                          value={order.jobStatus || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(i, e.target.value)
                          }
                          className="p-1 border rounded"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Finished">Finished</option>
                        </select>
                      </td>

                      <td className="border p-2">{order.paymentMethod}</td>

                      <td className="border p-2 text-center space-x-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                          onClick={() => downloadOrderFiles(order)}
                        >
                          Download
                        </button>
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded"
                          onClick={() => saveOrderChanges(order)}
                          disabled={savingOrderIds.includes(order.orderId)}
                        >
                          {savingOrderIds.includes(order.orderId)
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Order Form */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-2">➕ Create Custom Order</h2>
        <form
          onSubmit={handleCustomOrder}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Name"
            value={newOrder.name}
            onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newOrder.email}
            onChange={(e) =>
              setNewOrder({ ...newOrder, email: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={newOrder.phone}
            onChange={(e) =>
              setNewOrder({ ...newOrder, phone: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="datetime-local"
            value={newOrder.pickupTime}
            onChange={(e) =>
              setNewOrder({ ...newOrder, pickupTime: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newOrder.description}
            onChange={(e) =>
              setNewOrder({ ...newOrder, description: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={newOrder.price}
            onChange={(e) =>
              setNewOrder({ ...newOrder, price: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <select
            value={newOrder.paymentMethod}
            onChange={(e) =>
              setNewOrder({ ...newOrder, paymentMethod: e.target.value })
            }
            className="p-2 border rounded"
            required
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>
          <button
            type="submit"
            className="col-span-2 px-4 py-2 bg-green-600 text-white rounded"
          >
            Create Order
          </button>
        </form>
      </div>
    </div>
  );
}
