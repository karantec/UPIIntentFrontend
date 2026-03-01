const UPI_APPS = [
  {
    id: "phonepe",
    name: "PhonePe",
    package: "com.phonepe.app",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="#5f259f" />
        <path
          d="M18 6C11.37 6 6 11.37 6 18s5.37 12 12 12 12-5.37 12-12S24.63 6 18 6zm3.5 14.5h-3v2.5H16v-2.5h-3.5V10H18c1.66 0 3 1.34 3 3v4c0 1.66-1.34 3-3 3zm0-7H16v4h2.5c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    id: "gpay",
    name: "Google Pay",
    package: "com.google.android.apps.nbu.paisa.user",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="white" stroke="#e5e7eb" />
        <path
          d="M26.1 18.15c0-.54-.05-1.06-.14-1.56H18v2.95h4.54a3.88 3.88 0 01-1.68 2.55v2.12h2.72c1.59-1.46 2.52-3.62 2.52-6.06z"
          fill="#4285F4"
        />
        <path
          d="M18 27c2.43 0 4.47-.8 5.96-2.18l-2.72-2.11c-.76.51-1.73.81-3.24.81-2.49 0-4.6-1.68-5.35-3.94h-2.8v2.18A8.99 8.99 0 0018 27z"
          fill="#34A853"
        />
        <path
          d="M12.65 19.58a5.4 5.4 0 010-3.16v-2.18H9.86a9 9 0 000 7.52l2.79-2.18z"
          fill="#FBBC05"
        />
        <path
          d="M18 13.48c1.4 0 2.66.48 3.65 1.43l2.74-2.74A8.97 8.97 0 0018 9a8.99 8.99 0 00-8.14 5.24l2.79 2.18C13.4 15.16 15.51 13.48 18 13.48z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    id: "paytm",
    name: "Paytm",
    package: "net.one97.paytm",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="#00baf2" />
        <text
          x="18"
          y="22"
          textAnchor="middle"
          fill="white"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          paytm
        </text>
      </svg>
    ),
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    package: "in.org.npci.upiapp",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="#00529c" />
        <text
          x="18"
          y="22"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          BHIM
        </text>
      </svg>
    ),
  },
  {
    id: "amazonpay",
    name: "Amazon Pay",
    package: "in.amazon.mShop.android.shopping",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="#232f3e" />
        <text
          x="18"
          y="17"
          textAnchor="middle"
          fill="white"
          fontSize="7"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          amazon
        </text>
        <text
          x="18"
          y="26"
          textAnchor="middle"
          fill="#ff9900"
          fontSize="7"
          fontWeight="600"
          fontFamily="sans-serif"
        >
          pay
        </text>
      </svg>
    ),
  },
  {
    id: "any",
    name: "Any UPI App",
    package: null,
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="#f3f4f6" />
        <path
          d="M13 23l-1.5 1.5a2.83 2.83 0 01-4-4l2.5-2.5a2.83 2.83 0 013.95.08M23 13l1.5-1.5a2.83 2.83 0 014 4l-2.5 2.5a2.83 2.83 0 01-3.95-.08M15 21l6-6"
          stroke="#6b7280"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function PayUModal({
  isOpen,
  onClose,
  onSelectApp,
  loading,
  activeId,
  amount,
  upiLink,
  intentURIData,
}) {
  if (!isOpen) return null;

  const handleSelect = (app) => {
    if (loading) return;

    let deepLink = upiLink; // fallback: generic upi:// link

    if (intentURIData) {
      if (app.package) {
        // Android intent — opens specific app directly
        deepLink = `intent://pay?${intentURIData}#Intent;scheme=upi;package=${app.package};end`;
      } else {
        // Generic — OS shows UPI app chooser
        deepLink = `upi://pay?${intentURIData}`;
      }
    }

    onSelectApp(app, deepLink);
  };

  return (
    <>
      <div
        onClick={() => !loading && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          animation: "fadeIn 0.2s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 1001,
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 20,
          padding: "28px 24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  background: "#FF6B35",
                  borderRadius: 6,
                  padding: "2px 8px",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                  }}
                >
                  PayU
                </span>
              </div>
              <span style={{ fontSize: 12, color: "#aaa" }}>UPI Intent</span>
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111",
                margin: 0,
                marginBottom: 4,
              }}
            >
              Pay via UPI
            </h3>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              Amount:{" "}
              <strong style={{ color: "#111" }}>
                ₹
                {parseFloat(amount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </p>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "#f3f4f6",
              cursor: "pointer",
              fontSize: 16,
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ height: 1, background: "#f0f0f0", margin: "16px 0" }} />

        {/* Intent status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: upiLink ? "#f0fdf4" : "#fff7ed",
            border: `1px solid ${upiLink ? "#86efac" : "#fdba74"}`,
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 14,
            fontSize: 12,
            color: upiLink ? "#16a34a" : "#ea580c",
          }}
        >
          <span>{upiLink ? "✓" : "⚠"}</span>
          <span>
            {upiLink
              ? "UPI intent ready — select your app"
              : "UPI link unavailable — try refreshing"}
          </span>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#aaa",
            marginBottom: 14,
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          SELECT UPI APP
        </p>

        {/* App list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {UPI_APPS.map((app, i) => {
            const isActive = activeId === app.id;
            const isDimmed = loading && !isActive;
            return (
              <button
                key={app.id}
                onClick={() => handleSelect(app)}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 14px",
                  border: `2px solid ${isActive ? "#FF6B35" : "#f0f0f0"}`,
                  borderRadius: 12,
                  background: isActive ? "#fff5f0" : "#fafafa",
                  cursor: loading ? "default" : "pointer",
                  opacity: isDimmed ? 0.35 : 1,
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                }}
              >
                <span style={{ flexShrink: 0, lineHeight: 0 }}>{app.icon}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 600,
                    color: isActive ? "#FF6B35" : "#222",
                  }}
                >
                  {app.name}
                </span>
                {isActive && loading ? (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: "2.5px solid #ffe0d3",
                      borderTop: "2.5px solid #FF6B35",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 3l5 5-5 5"
                      stroke={isActive ? "#FF6B35" : "#ccc"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <span style={{ fontSize: 12, color: "#aaa" }}>
            🔒 Secured by PayU Payments
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes modalPop { from{opacity:0;transform:translate(-50%,-48%) scale(0.95)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}
