export default function ResultScreen({ status, orderId, amount, onReset }) {
  const isPaid = status === "PAID";
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{isPaid ? "✅" : "❌"}</div>
      <h2 style={{ color: isPaid ? "#16a34a" : "#dc2626", marginBottom: 8 }}>
        {isPaid ? "Payment Successful" : "Payment Failed"}
      </h2>
      {isPaid && (
        <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          ₹{parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      )}
      {orderId && (
        <p style={{ color: "#888", fontSize: 12, fontFamily: "monospace", marginBottom: 24 }}>
          Order: {orderId}
        </p>
      )}
      <button
        onClick={onReset}
        style={{
          width: "100%", padding: 14, background: "#6c63ff",
          color: "#fff", border: "none", borderRadius: 8,
          fontSize: 15, fontWeight: 700, cursor: "pointer",
        }}
      >
        {isPaid ? "Make Another Payment" : "Try Again"}
      </button>
    </div>
  );
}