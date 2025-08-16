import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import OrderForm from "./components/OrderForm";

function AdminRoute({ children }) {
  const adminPwd = sessionStorage.getItem("adminPwd");
  return adminPwd ? children : <Navigate to="/admin" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OrderForm />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
