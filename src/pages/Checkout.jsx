import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useCart } from "../ShopCart";
import axios from "axios";

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();

  const [street, setStreet] = useState("");
  const [block, setBlock] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saved, setSaved] = useState([]);
  const [choice, setChoice] = useState("new");
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);
  const [sending, setSending] = useState(false);

  // copy a saved address into the 4 fields
  function fillFrom(a) {
    setStreet(a.street);
    setBlock(a.block);
    setCity(a.city);
    setPostalCode(a.postal_code);
    setChoice(String(a.address_id));
  }

  // load the customer's saved addresses once
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("/api/users/addresses", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setSaved(res.data);
        if (res.data.length > 0) {
          fillFrom(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  function handleChoose(e) {
    const value = e.target.value;
    if (value === "new") {
      setStreet("");
      setBlock("");
      setCity("");
      setPostalCode("");
      setChoice("new");
    } else {
      const a = saved.find((x) => String(x.address_id) === value);
      fillFrom(a);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!street || !block || !city || !postalCode) {
      setError("Please fill in every field.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in before placing an order.");
      return;
    }

    setError("");
    setSending(true);

    const items = cart.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const address = { street, block, city, postalCode };

    try {
      await axios.post(
        "/api/orders",
        { items, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearCart();
      setPlaced(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not place the order."
      );
    } finally {
      setSending(false);
    }
  }

  if (placed) {
    return (
      <section className="page">
        <h2>Thank you for shopping</h2>
        <p>Your purchased is confirmed.</p>
        <Link href="/shop" className="btn">Back to shop</Link>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="page">
        <h2>Checkout</h2>
        <p>Your bag is empty.</p>
        <Link href="/shop" className="btn">Continue shopping</Link>
      </section>
    );
  }

  const showForm = saved.length === 0 || choice === "new";

  return (
    <section className="page">
      <h2>Checkout</h2>

      <div className="checkout-layout">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h3>Shipping address</h3>

          {saved.length > 0 && (
            <>
              <label htmlFor="saved">Choose an address</label>
              <select id="saved" value={choice} onChange={handleChoose}>
                {saved.map((a) => (
                  <option key={a.address_id} value={String(a.address_id)}>
                    {a.street}, {a.block}, {a.city} {a.postal_code}
                  </option>
                ))}
                <option value="new">+ Use a new address</option>
              </select>
            </>
          )}

          {showForm && (
            <>
              <label htmlFor="street">Street</label>
              <input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />

              <label htmlFor="block">Block / Unit</label>
              <input id="block" value={block} onChange={(e) => setBlock(e.target.value)} />

              <label htmlFor="city">City</label>
              <input id="city" value={city} onChange={(e) => setCity(e.target.value)} />

              <label htmlFor="postal">Postal code</label>
              <input id="postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="btn" type="submit" disabled={sending}>
            {sending ? "Placing order..." : "Place order"}
          </button>
        </form>

        <div className="order-summary">
          <h3>Order summary</h3>

          {cart.map((item) => (
            <div className="summary-row" key={item.variantId}>
              <span>{item.name} ({item.color} / {item.size}) × {item.quantity}</span>
              <span>${item.price * item.quantity}</span>
            </div>
          ))}

          <p className="cart-total">Total: ${getCartTotal()}</p>
        </div>
      </div>
    </section>
  );
}