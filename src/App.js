import { useState, useRef } from "react";
// Cashfree
// PayU
import { api, pollStatus } from "./api";
import PayUModal from "./Components/payyumodel";
import UPIModal from "./UPIModal";

// ─────────────────────────────────────────────────────────────────────────────
// api.js — add these two PayU helpers alongside existing ones:
//
// export const payuApi = {
//   initiate:   (body) => request("POST", "/payu/initiate", body),
//   getStatus:  (txnid) => request("GET", `/payu/status/${txnid}`),
// };
//
// export function pollPayuStatus(txnid, onTick, interval = 3000, timeout = 300_000) {
//   const deadline = Date.now() + timeout;
//   const id = setInterval(async () => {
//     if (Date.now() > deadline) { clearInterval(id); onTick({ status: "TIMEOUT" }); return; }
//     try {
//       const res = await payuApi.getStatus(txnid);
//       onTick(res.data);
//       if (["success","failure","TIMEOUT"].includes(res.data.status)) clearInterval(id);
//     } catch (_) {}
//   }, interval);
//   return () => clearInterval(id);
// }
// ─────────────────────────────────────────────────────────────────────────────

// Inline the PayU api helpers here so you can also just add to api.js
async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success)
    throw new Error(data.errors?.join(", ") || data.message || "Error");
  return data;
}

const payuApi = {
  initiate: (body) => request("POST", "/payu/initiate", body),
  getStatus: (txnid) => request("GET", `/payu/status/${txnid}`),
};

function pollPayuStatus(txnid, onTick, interval = 3000, timeout = 300_000) {
  const deadline = Date.now() + timeout;
  const id = setInterval(async () => {
    if (Date.now() > deadline) {
      clearInterval(id);
      onTick({ status: "TIMEOUT" });
      return;
    }
    try {
      const res = await payuApi.getStatus(txnid);
      onTick(res.data);
      if (["success", "failure", "TIMEOUT"].includes(res.data.status))
        clearInterval(id);
    } catch (_) {}
  }, interval);
  return () => clearInterval(id);
}

export default function App() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    amount: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });
  const [errors, setErrors] = useState({});

  // ── Cashfree state ──────────────────────────────────────────────────────────
  const [cfLoading, setCfLoading] = useState(false);
  const [cfModalOpen, setCfModalOpen] = useState(false);
  const [cfUpiLoading, setCfUpiLoading] = useState(false);
  const [cfActiveApp, setCfActiveApp] = useState(null);
  const [cfOrder, setCfOrder] = useState(null);

  // ── PayU state ──────────────────────────────────────────────────────────────
  const [pyLoading, setPyLoading] = useState(false);
  const [pyModalOpen, setPyModalOpen] = useState(false);
  const [pyUpiLoading, setPyUpiLoading] = useState(false);
  const [pyActiveApp, setPyActiveApp] = useState(null);
  const [pyData, setPyData] = useState(null); // { params, txnid, payuUrl }

  // ── Shared ──────────────────────────────────────────────────────────────────
  const [banner, setBanner] = useState(null);
  const [result, setResult] = useState(null);
  const stopPoll = useRef(null);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.amount || parseFloat(form.amount) < 1)
      e.amount = "Min ₹1 required";
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      e.customerEmail = "Invalid email";
    if (!/^[6-9]\d{9}$/.test(form.customerPhone))
      e.customerPhone = "Enter valid 10-digit number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── CASHFREE: Click "Pay via Cashfree UPI" ──────────────────────────────────
  const handleCashfreeClick = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBanner(null);
    setCfLoading(true);
    try {
      const res = await api.createOrder(form);
      setCfOrder(res.data);
      setCfModalOpen(true);
    } catch (err) {
      setBanner(`Cashfree: ${err.message}`);
    } finally {
      setCfLoading(false);
    }
  };

  // ── CASHFREE: User picks UPI app ────────────────────────────────────────────
  const handleCashfreeApp = async (app) => {
    setBanner(null);
    setCfUpiLoading(true);
    setCfActiveApp(app);
    try {
      const res = await api.initiateUpiIntent({
        paymentSessionId: cfOrder.paymentSessionId,
        channel: app.channel,
      });
      if (res.data?.upiLink) window.location.href = res.data.upiLink;
      setCfModalOpen(false);

      stopPoll.current = pollStatus(cfOrder.orderId, (tick) => {
        if (
          ["PAID", "EXPIRED", "CANCELLED", "TIMEOUT"].includes(tick.orderStatus)
        ) {
          setResult({
            gateway: "Cashfree",
            status: tick.orderStatus === "PAID" ? "success" : "failure",
            orderId: tick.orderId || cfOrder.orderId,
            amount: tick.orderAmount || cfOrder.orderAmount,
          });
        }
      });
    } catch (err) {
      setBanner(`Cashfree: ${err.message}`);
      setCfActiveApp(null);
    } finally {
      setCfUpiLoading(false);
    }
  };

  // ── PAYU: Click "Pay via PayU UPI" ─────────────────────────────────────────
  const handlePayuClick = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBanner(null);
    setPyLoading(true);
    try {
      const res = await payuApi.initiate(form);
      setPyData(res.data);
      setPyModalOpen(true);
    } catch (err) {
      setBanner(`PayU: ${err.message}`);
    } finally {
      setPyLoading(false);
    }
  };

  // ── PAYU: User picks UPI app ────────────────────────────────────────────────
  // PayU S2S flow: POST the params to PayU's _payment URL via hidden form,
  // PayU returns intentURIData → open deep link to launch UPI app
  const handlePayuApp = async (app, intentUri) => {
    setBanner(null);
    setPyUpiLoading(true);
    setPyActiveApp(app);

    try {
      if (intentUri) {
        // intentUri already available (from a previous S2S call) — just open it
        window.location.href = intentUri;
        setPyModalOpen(false);
        pollPayuStatus(pyData.txnid, (tick) => {
          if (["success", "failure", "TIMEOUT"].includes(tick.status)) {
            setResult({
              gateway: "PayU",
              status: tick.status,
              orderId: tick.txnid || pyData.txnid,
              amount: form.amount,
            });
          }
        });
      } else {
        // Submit hidden form to PayU _payment endpoint to get intent URI (S2S flow)
        submitPayuForm(pyData.params, pyData.payuUrl);
        setPyModalOpen(false);

        // After redirect back, status will be on surl/furl
        // Poll to confirm
        pollPayuStatus(pyData.txnid, (tick) => {
          if (["success", "failure", "TIMEOUT"].includes(tick.status)) {
            setResult({
              gateway: "PayU",
              status: tick.status,
              orderId: tick.txnid || pyData.txnid,
              amount: form.amount,
            });
          }
        });
      }
    } catch (err) {
      setBanner(`PayU: ${err.message}`);
      setPyActiveApp(null);
    } finally {
      setPyUpiLoading(false);
    }
  };

  // Submits a hidden HTML form to PayU's _payment URL
  // This is the standard PayU payment initiation method for web
  const submitPayuForm = (params, url) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    Object.entries(params).forEach(([key, val]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = val;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    stopPoll.current?.();
    setForm({
      amount: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    });
    setErrors({});
    setCfOrder(null);
    setCfActiveApp(null);
    setCfModalOpen(false);
    setPyData(null);
    setPyActiveApp(null);
    setPyModalOpen(false);
    setResult(null);
    setBanner(null);
  };

  // ── Result screen ───────────────────────────────────────────────────────────
  if (result) {
    const isPaid = result.status === "success" || result.status === "PAID";
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>
              {isPaid ? "✅" : "❌"}
            </div>
            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>
              via {result.gateway}
            </p>
            <h2
              style={{
                color: isPaid ? "#16a34a" : "#dc2626",
                marginBottom: 8,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {isPaid ? "Payment Successful" : "Payment Failed"}
            </h2>
            {isPaid && (
              <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
                ₹
                {parseFloat(result.amount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
            <p
              style={{
                fontSize: 11,
                color: "#aaa",
                fontFamily: "monospace",
                marginBottom: 28,
              }}
            >
              {result.orderId}
            </p>
            <button onClick={handleReset} style={s.primaryBtn}>
              {isPaid ? "Make Another Payment" : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout form ───────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Error banner */}
        {banner && (
          <div style={s.banner}>
            <span>⚠ {banner}</span>
            <button onClick={() => setBanner(null)} style={s.bannerClose}>
              ✕
            </button>
          </div>
        )}

        <h2 style={s.title}>Checkout</h2>
        <p
          style={{
            color: "#888",
            fontSize: 14,
            marginBottom: 24,
            marginTop: -16,
          }}
        >
          Choose how you want to pay
        </p>

        <form noValidate>
          {/* Amount */}
          {field(
            "Amount (₹)",
            "number",
            "499",
            form.amount,
            errors.amount,
            (v) => {
              setForm({ ...form, amount: v });
              setErrors({ ...errors, amount: null });
            },
          )}
          {field(
            "Full Name",
            "text",
            "Rahul Sharma",
            form.customerName,
            errors.customerName,
            (v) => {
              setForm({ ...form, customerName: v });
              setErrors({ ...errors, customerName: null });
            },
          )}
          {field(
            "Email",
            "email",
            "rahul@gmail.com",
            form.customerEmail,
            errors.customerEmail,
            (v) => {
              setForm({ ...form, customerEmail: v });
              setErrors({ ...errors, customerEmail: null });
            },
          )}
          {field(
            "Phone",
            "tel",
            "9876543210",
            form.customerPhone,
            errors.customerPhone,
            (v) => {
              setForm({ ...form, customerPhone: v });
              setErrors({ ...errors, customerPhone: null });
            },
            10,
          )}

          {/* ── Two payment buttons ─────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 8,
            }}
          >
            {/* Cashfree UPI button */}
            <button
              type="button"
              onClick={handleCashfreeClick}
              disabled={cfLoading || pyLoading}
              style={{
                ...s.payBtn,
                background: "linear-gradient(135deg, #1a56db, #6c63ff)",
                boxShadow: "0 4px 14px rgba(108,99,255,0.35)",
              }}
            >
              {cfLoading ? (
                <BtnLoader />
              ) : (
                <BtnContent label="Pay via Cashfree UPI" amount={form.amount} />
              )}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
              <span style={{ fontSize: 12, color: "#ccc" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
            </div>

            {/* PayU UPI button */}
            <button
              type="button"
              onClick={handlePayuClick}
              disabled={cfLoading || pyLoading}
              style={{
                ...s.payBtn,
                background: "linear-gradient(135deg, #FF6B35, #f7931e)",
                boxShadow: "0 4px 14px rgba(255,107,53,0.35)",
              }}
            >
              {pyLoading ? (
                <BtnLoader />
              ) : (
                <BtnContent
                  label="Pay via PayU UPI"
                  amount={form.amount}
                  badge="PayU"
                />
              )}
            </button>
          </div>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#bbb",
            marginTop: 16,
          }}
        >
          🔒 All payments are encrypted and secure
        </p>
      </div>

      {/* Cashfree UPI Modal */}
      <UPIModal
        isOpen={cfModalOpen}
        onClose={() => setCfModalOpen(false)}
        onSelectApp={handleCashfreeApp}
        loading={cfUpiLoading}
        activeId={cfActiveApp?.id}
        amount={cfOrder?.orderAmount}
      />

      {/* PayU UPI Modal */}
      <PayUModal
        isOpen={pyModalOpen}
        onClose={() => setPyModalOpen(false)}
        onSelectApp={handlePayuApp}
        loading={pyUpiLoading}
        activeId={pyActiveApp?.id}
        amount={form.amount}
        payuData={pyData}
      />
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function field(label, type, placeholder, value, error, onChange, maxLength) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#444",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 14px",
          fontSize: 15,
          border: `1.5px solid ${error ? "#f43f5e" : "#e5e7eb"}`,
          borderRadius: 10,
          outline: "none",
          boxSizing: "border-box",
          background: "#fafafa",
          color: "#111",
        }}
      />
      {error && (
        <p style={{ fontSize: 12, color: "#f43f5e", marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}

function BtnLoader() {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          border: "2px solid rgba(255,255,255,0.3)",
          borderTop: "2px solid #fff",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
          display: "inline-block",
        }}
      />
      Preparing…
    </span>
  );
}

function BtnContent({ label, amount, badge }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 800, opacity: 0.9 }}>UPI</span>
      {badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 4,
            padding: "1px 6px",
          }}
        >
          {badge}
        </span>
      )}
      {label}
      {amount && parseFloat(amount) > 0 && (
        <span style={{ opacity: 0.8 }}>
          · ₹{parseFloat(amount).toLocaleString("en-IN")}
        </span>
      )}
    </span>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f4f8",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 20,
    padding: "32px 28px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111",
    marginBottom: 8,
    letterSpacing: "-0.02em",
  },
  banner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 20,
    fontSize: 13,
    gap: 8,
  },
  bannerClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#dc2626",
    fontSize: 14,
    flexShrink: 0,
  },
  payBtn: {
    width: "100%",
    padding: "14px",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "-0.01em",
    transition: "opacity 0.2s",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};
