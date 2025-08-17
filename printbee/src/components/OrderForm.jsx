import React, { useState } from "react";
import { motion } from "framer-motion";
import mourya_qrcode from "../assets/mourya_qrcode.jpeg";

const API = "https://rpmourya-printbee.onrender.com/order";

export default function OrderForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pickupTime: "",
    description: "",
    paymentMethod: "",
    price: "",
    fileLink: "",
  });
  const [files, setFiles] = useState([]); // store multiple files
  const [status, setStatus] = useState({ loading: false, msg: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFile = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    if (selected.length > 0) setForm({ ...form, fileLink: "" });
  };

  function toBase64(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result.split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const getUpiLink = () => {
    const upiId = payments.UPI.value;
    const payeeName = "PrintShop";
    const note = "Print Order";
    const amount = form.price || "";
    return `upi://pay?pa=${upiId}&pn=${payeeName}&tn=${note}&am=${amount}&cu=INR`;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setStatus({ loading: true, msg: "" });

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.pickupTime ||
      !form.description ||
      !form.paymentMethod
    ) {
      setStatus({ loading: false, msg: "Please fill required fields." });
      return;
    }

    if (files.length === 0 && !form.fileLink) {
      setStatus({ loading: false, msg: "Attach file(s) or provide link." });
      return;
    }

    // check size limit
    for (let f of files) {
      if (f.size > 100 * 1024 * 1024) {
        setStatus({
          loading: false,
          msg: `File ${f.name} >100MB: please provide external link.`,
        });
        return;
      }
    }

    try {
      const payload = {
        action: "create",
        name: form.name,
        email: form.email,
        phone: form.phone,
        pickupTime: form.pickupTime,
        description: form.description,
        paymentMethod: form.paymentMethod,
        price: form.price || "",
      };

      if (files.length > 0) {
        payload.files = [];
        for (const f of files) {
          const base64 = await toBase64(f);
          payload.files.push({
            fileBase64: base64,
            fileName: f.name,
            fileMimeType: f.type,
          });
        }
      } else {
        payload.fileLink = form.fileLink;
      }

      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response: " + text);
      }

      if (data.success) {
        setStatus({
          loading: false,
          msg: `✅ Order submitted! ID: ${data.orderId}`,
        });
        setForm({
          name: "",
          email: "",
          phone: "",
          pickupTime: "",
          description: "",
          paymentMethod: "",
          price: "",
          fileLink: "",
        });
        setFiles([]);
      } else {
        setStatus({
          loading: false,
          msg: "❌ Error: " + (data.error || "unknown"),
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, msg: "⚠️ Submission failed." });
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

  const payments = {
    Cash: { type: "cash", label: "Pay with cash upon pickup" },
    UPI: { type: "upi", value: "9490054499@ybl", label: "Pay via UPI ID" },
    "QR Code": {
      type: "qr",
      qrUrl: mourya_qrcode,
      label: "Scan this QR to pay",
    },
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">
        Place Print Order
      </h2>
      <form onSubmit={submit} className="space-y-6">
        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Name*"
            className={inputClass}
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email*"
            className={inputClass}
          />
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="Phone*"
            className={inputClass}
          />
          <input
            name="pickupTime"
            type="datetime-local"
            value={form.pickupTime}
            onChange={onChange}
            className={inputClass}
          />
        </div>

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Description (paper size, color/BW, copies...)*"
          rows="4"
          className={`${inputClass} resize-none`}
        ></textarea>

        {/* File Upload */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <label className="block w-full md:w-auto">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Attach Files (≤100MB each)
            </div>
            <input
              type="file"
              onChange={onFile}
              multiple
              accept=".cdr,.ai,.psd,.indd,.xd,.fig,.sketch,.pdf,.eps,.svg,.jpg,.jpeg,.png,.tiff,.webp"
              className="block w-full text-sm text-gray-600 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </label>
          <span className="text-sm text-gray-400 mt-2 md:mt-0">
            OR paste external link
          </span>
          <input
            name="fileLink"
            value={form.fileLink}
            onChange={onChange}
            placeholder="https://drive.google.com/..."
            className={`${inputClass} flex-1`}
          />
        </div>

        {/* Payment */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={onChange}
            className={`${inputClass} w-full md:w-48`}
          >
            <option value="">Payment method*</option>
            {Object.keys(payments).map((key) => (
              <option key={key}>{key}</option>
            ))}
          </select>

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={onChange}
            placeholder="Price (optional)"
            className={`${inputClass} w-full md:w-40`}
          />

          <button
            disabled={status.loading}
            type="submit"
            className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
          >
            {status.loading ? "Submitting..." : "Submit Order"}
          </button>
        </div>

        {/* Payment Info */}
        {form.paymentMethod && (
          <motion.div
            key={form.paymentMethod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 p-4 border rounded-lg bg-gray-50 text-gray-700"
          >
            {payments[form.paymentMethod].type === "cash" && (
              <p>{payments[form.paymentMethod].label}</p>
            )}

            {payments[form.paymentMethod].type === "upi" && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <p>
                  UPI ID: <strong>{payments[form.paymentMethod].value}</strong>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(payments[form.paymentMethod].value)
                    }
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Copy
                  </button>
                  <a
                    href={getUpiLink()}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Pay via UPI App
                  </a>
                </div>
              </div>
            )}

            {payments[form.paymentMethod].type === "qr" && (
              <div className="flex flex-col items-center">
                <p className="mb-2">{payments[form.paymentMethod].label}</p>
                <motion.img
                  src={payments[form.paymentMethod].qrUrl}
                  alt="QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg shadow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            )}
          </motion.div>
        )}
      </form>

      {/* Status Messages */}
      {status.msg && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700 font-medium">
          {status.msg}
        </div>
      )}
    </div>
  );
}
