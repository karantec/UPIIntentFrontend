import { UPI_APPS } from "../upiApps";

export default function UPISelector({ amount, onSelect, onBack, loading, activeId }) {
  return (
    <div>
      <button onClick={onBack} disabled={loading}
        style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 16, fontSize: 14 }}>
        ← Back
      </button>
      <h2 style={{ marginBottom: 4 }}>
        Pay ₹{parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </h2>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>Choose your UPI app</p>

      {UPI_APPS.map((app) => (
        <button
          key={app.id}
          onClick={() => onSelect(app)}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            width: "100%", padding: "13px 16px", marginBottom: 10,
            border: `2px solid ${activeId === app.id ? app.color : "#e5e5e5"}`,
            borderRadius: 10, background: "#fff", cursor: "pointer",
            opacity: loading && activeId !== app.id ? 0.4 : 1,
          }}
        >
          <span style={{
            width: 36, height: 36, borderRadius: 8,
            background: app.color, display: "inline-block", flexShrink: 0,
          }} />
          <span style={{ flex: 1, fontWeight: 600, fontSize: 15, textAlign: "left" }}>
            {app.name}
          </span>
          {activeId === app.id && loading
            ? <span>⏳</span>
            : <span style={{ color: "#aaa" }}>›</span>
          }
        </button>
      ))}
    </div>
  );
}