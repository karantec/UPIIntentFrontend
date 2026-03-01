import { useState } from "react";

export default function PaymentForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    amount: "", customerName: "", customerEmail: "", customerPhone: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.amount || parseFloat(form.amount) < 1)        e.amount        = "Min ₹1";
    if (!form.customerName.trim())                           e.customerName  = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) e.customerEmail = "Invalid email";
    if (!/^[6-9]\d{9}$/.test(form.customerPhone))           e.customerPhone = "10-digit mobile";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const field = (key, label, type, placeholder) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => {
          setForm({ ...form, [key]: e.target.value });
          if (errors[key]) setErrors({ ...errors, [key]: null });
        }}
        style={{
          width: "100%", padding: "11px 14px", fontSize: 15,
          border: `1.5px solid ${errors[key] ? "#f43f5e" : "#ddd"}`,
          borderRadius: 8, outline: "none", boxSizing: "border-box",
        }}
      />
      {errors[key] && <p style={{ color: "#f43f5e", fontSize: 12, marginTop: 4 }}>{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 style={{ marginBottom: 24 }}>Checkout</h2>
      {field("amount",        "Amount (₹)",  "number", "499")}
      {field("customerName",  "Full Name",   "text",   "Rahul Sharma")}
      {field("customerEmail", "Email",       "email",  "rahul@gmail.com")}
      {field("customerPhone", "Phone",       "tel",    "9876543210")}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%", padding: 14, background: "#6c63ff",
          color: "#fff", border: "none", borderRadius: 8,
          fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8,
        }}
      >
        {loading ? "Creating order…" : "Continue to Pay →"}
      </button>
    </form>
  );
}