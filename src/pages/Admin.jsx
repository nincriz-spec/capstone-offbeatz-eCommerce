import { useEffect, useState } from "react";
import { Link } from "wouter";
import axios from "axios";
import { useAuth } from "../AuthStore";
import { useFlash } from "../FlashStore";
import getRole from "../getRole";

// which status can go to which (the server checks this again)
const nextStatuses = {
  pending: ["paid", "shipped", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

// the middle part of a token is just JSON, so we can read the role from it
function getRole(token) {
  try {
    const middle = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(middle)).role;
  } catch {
    return null;
  }
}

export default function Admin() {
  const { isLoggedIn, token } = useAuth();
  const { showMessage } = useFlash();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const role = isLoggedIn ? getRole(token) : null;

  function loadOrders() {
    axios
      .get("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setOrders(res.data))
      .catch(() => setError("Could not load orders."));
  }

  useEffect(() => {
    if (role === "admin") {
      loadOrders();
    }
  }, [role, token]);

  async function handleStatus(orderId, newStatus) {
    if (!newStatus) return;
    try {
      await axios.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage("Order #" + orderId + " is now " + newStatus, "success");
      loadOrders();
    } catch (err) {
      showMessage(err.response?.data?.message || "Could not change the status", "error");
    }
  }

  if (!isLoggedIn) {
    return (
      <section className="page">
        <h2>Admin</h2>
        <p>Please log in.</p>
        <Link href="/login" className="btn">Log in</Link>
      </section>
    );
  }

  if (role !== "admin") {
    return (
      <section className="page">
        <h2>Admin</h2>
        <p>This page is for admins only.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h2>Admin: all orders</h2>

      {error && <p className="form-error">{error}</p>}
      {orders.length === 0 && !error && <p>No orders yet.</p>}

      {orders.map((o) => (
        <div className="order-card" key={o.order_id}>
          <div className="order-card-head">
            <span>Order #{o.order_id}</span>
            <span>{o.customer_name} ({o.customer_email})</span>
            <span>{new Date(o.created_at).toLocaleDateString()}</span>
            <span className="order-status">{o.status}</span>
          </div>

          {o.items.map((item) => (
            <div className="summary-row" key={item.order_id + "-" + item.variant_id}>
              <span>
                {item.name} ({item.color} / {item.size}) × {item.quantity}
              </span>
              <span>${item.unit_price * item.quantity}</span>
            </div>
          ))}

          <p className="cart-total">Total: ${o.total}</p>

          {nextStatuses[o.status].length > 0 && (
            <div className="admin-status">
              <label htmlFor={"status-" + o.order_id}>Change status</label>
              <select
                id={"status-" + o.order_id}
                value=""
                onChange={(e) => handleStatus(o.order_id, e.target.value)}
              >
                <option value="">Choose...</option>
                {nextStatuses[o.status].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}