import { useEffect, useState } from "react";
import { Link } from "wouter";
import axios from "axios";
import { useAuth } from "../AuthStore";
import { useFlash } from "../FlashStore";
import ProfileTab from "../ProfileTab";
import AddressesTab from "../AddressesTab";

const orderTabs = [
  { key: "all", label: "All", statuses: [] },
  { key: "processing", label: "Processing", statuses: ["pending", "paid"] },
  { key: "shipped", label: "Shipped", statuses: ["shipped"] },
  { key: "received", label: "Received", statuses: ["delivered"] },
  { key: "refund", label: "Return / refund", statuses: ["cancelled"] },
];

export default function Account() {
  const { isLoggedIn, token } = useAuth();
  const { showMessage } = useFlash();
  const [tab, setTab] = useState("profile");
  const [orderTab, setOrderTab] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("/api/users/me", { headers })
      .then((res) => setProfile(res.data))
      .catch(() => setError("Could not load your profile. Please log in again."));

    axios
      .get("/api/orders", { headers })
      .then((res) => setOrders(res.data))
      .catch(() => setError("Could not load your orders. Please log in again."));

    axios
      .get("/api/users/addresses", { headers })
      .then((res) => setAddresses(res.data))
      .catch(() => setError("Could not load your addresses. Please log in again."));
  }, [isLoggedIn, token]);

  async function handleCancel(orderId) {
    if (!window.confirm("Cancel this order?")) return;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.put(`/api/orders/${orderId}/cancel`, {}, { headers });
      const res = await axios.get("/api/orders", { headers });
      setOrders(res.data);
      showMessage("Order cancelled", "success");
    } catch (err) {
      showMessage(err.response?.data?.error || "Could not cancel the order", "error");
    }
  }

  function clearOrderFilters() {
    setOrderTab("all");
    setOrderSearch("");
    setFromDate("");
    setToDate("");
  }

  if (!isLoggedIn) {
    return (
      <section className="page">
        <h2>My account</h2>
        <p>Please log in to see your account.</p>
        <Link href="/login" className="btn">Log in</Link>
      </section>
    );
  }

  const currentTab = orderTabs.find((t) => t.key === orderTab);
  const searchText = orderSearch.trim().toLowerCase().replace("#", "");
  const hasOrderFilters =
    orderTab !== "all" || searchText !== "" || fromDate !== "" || toDate !== "";

  // An order stays in the list only if it passes every filter
  const visibleOrders = orders.filter((o) => {
    // 1. status tab
    if (orderTab !== "all" && !currentTab.statuses.includes(o.status)) {
      return false;
    }
    // 2. search: order number or a product name
    if (searchText) {
      const inNumber = String(o.order_id).includes(searchText);
      const inItems = o.items.some((item) =>
        item.name.toLowerCase().includes(searchText)
      );
      if (!inNumber && !inItems) {
        return false;
      }
    }
    // 3. date range (whole days)
    const created = new Date(o.created_at);
    if (fromDate && created < new Date(fromDate + "T00:00:00")) {
      return false;
    }
    if (toDate && created > new Date(toDate + "T23:59:59")) {
      return false;
    }
    return true;
  });

  return (
    <section className="page">
      <h2>My account</h2>

      <div className="account-layout">
        <nav className="account-menu">
          <button
            className={tab === "profile" ? "account-menu-item active" : "account-menu-item"}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={tab === "orders" ? "account-menu-item active" : "account-menu-item"}
            onClick={() => setTab("orders")}
          >
            My orders
          </button>
          <button
            className={tab === "addresses" ? "account-menu-item active" : "account-menu-item"}
            onClick={() => setTab("addresses")}
          >
            Addresses
          </button>
        </nav>

        <div className="account-content">
          {error && <p className="form-error">{error}</p>}

          {tab === "profile" && (
            <ProfileTab profile={profile} token={token} onSaved={setProfile} />
          )}

          {tab === "orders" && (
            <div>
              <h3>My orders</h3>

              <div className="order-tabs">
                {orderTabs.map((t) => (
                  <button
                    key={t.key}
                    className={t.key === orderTab ? "filter-pill active" : "filter-pill"}
                    onClick={() => setOrderTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="filter-form">
                <input
                  type="text"
                  placeholder="Search order # or product"
                  aria-label="Search orders by number or product name"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
                <label>
                  From{" "}
                  <input
                    type="date"
                    aria-label="From date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </label>
                <label>
                  To{" "}
                  <input
                    type="date"
                    aria-label="To date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </label>
                <button type="button" className="order-clear" onClick={clearOrderFilters}>
                  Clear
                </button>
              </div>

              <p>
                Showing {visibleOrders.length} of {orders.length} order(s)
              </p>

              {visibleOrders.length === 0 && (
                <p>{hasOrderFilters ? "No orders match your filters." : "No orders here yet."}</p>
              )}

              {visibleOrders.map((o) => (
                <div className="order-card" key={o.order_id}>
                  <div className="order-card-head">
                    <span>Order #{o.order_id}</span>
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

                  {o.status === "pending" && (
                    <div className="form-actions">
                      <button className="btn" onClick={() => handleCancel(o.order_id)}>
                        Cancel order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "addresses" && (
            <AddressesTab addresses={addresses} token={token} onChanged={setAddresses} />
          )}
        </div>
      </div>
    </section>
  );
}