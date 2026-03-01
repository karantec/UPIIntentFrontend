const BASE = "/api";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success)
    throw new Error(data.errors?.join(", ") || data.message || "Error");
  return data;
}

export const api = {
  createOrder: (body) => request("POST", "/orders", body),
  initiateUpiIntent: (body) => request("POST", "/payments/upi-intent", body),
  getOrderStatus: (id) => request("GET", `/orders/${id}/status`),
};

// Call this after upiIntent — polls every 3s until PAID/EXPIRED/CANCELLED
export function pollStatus(
  orderId,
  onTick,
  interval = 3000,
  timeout = 300_000,
) {
  const deadline = Date.now() + timeout;
  const timerId = setInterval(async () => {
    if (Date.now() > deadline) {
      clearInterval(timerId);
      onTick({ orderStatus: "TIMEOUT" });
      return;
    }
    try {
      const res = await api.getOrderStatus(orderId);
      onTick(res.data);
      if (["PAID", "EXPIRED", "CANCELLED"].includes(res.data.orderStatus)) {
        clearInterval(timerId);
      }
    } catch (_) {}
  }, interval);
  return () => clearInterval(timerId); // returns a stop function
}
