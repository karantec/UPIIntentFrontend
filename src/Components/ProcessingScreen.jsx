export default function ProcessingScreen({ appName, amount, onCancel }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>📱</div>
      <h2 style={{ marginBottom: 8 }}>Waiting for Payment</h2>
      <p style={{ color: "#666", marginBottom: 28 }}>
        Complete your ₹{parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} payment in <strong>{appName}</strong>
      </p>
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 24 }}>
        Checking status every few seconds…
      </p>
      <button
        onClick={onCancel}
        style={{
          background: "none", border: "1.5px solid #ddd", borderRadius: 8,
          padding: "10px 20px", cursor: "pointer", fontSize: 13, color: "#666",
        }}
      >
        Cancel &amp; choose another app
      </button>
    </div>
  );
}