const BASE = "srv-d6i9bd4r85hc739uqmqg/api";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || res.statusText);
  }

  return text ? JSON.parse(text) : {};
}

/* ───────── CASHFREE ───────── */

export const api = {
  createOrder: (body) => request("POST", "/orders", body),

  initiateUpiIntent: (body) => request("POST", "/payments/upi-intent", body),

  getOrderStatus: (id) => request("GET", `/orders/${id}/status`),
};

export function pollStatus(orderId, onTick, interval = 3000, timeout = 300000) {
  const deadline = Date.now() + timeout;

  const id = setInterval(async () => {
    if (Date.now() > deadline) {
      clearInterval(id);
      onTick({ orderStatus: "TIMEOUT" });
      return;
    }

    try {
      const res = await api.getOrderStatus(orderId);
      onTick(res.data);

      if (
        ["PAID", "EXPIRED", "CANCELLED", "TIMEOUT"].includes(
          res.data.orderStatus,
        )
      ) {
        clearInterval(id);
      }
    } catch (err) {
      console.error(err);
    }
  }, interval);

  return () => clearInterval(id);
}

/* ───────── PAYU ───────── */

export const payuApi = {
  initiate: (body) => request("POST", "/payu/initiate", body),

  getStatus: (txnid) => request("GET", `/payu/status/${txnid}`),
};

export function pollPayuStatus(
  txnid,
  onTick,
  interval = 3000,
  timeout = 300000,
) {
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

      if (["success", "failure", "TIMEOUT"].includes(res.data.status)) {
        clearInterval(id);
      }
    } catch (err) {
      console.error(err);
    }
  }, interval);

  return () => clearInterval(id);
}
