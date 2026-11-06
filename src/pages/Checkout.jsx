import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "../ShopCart";
import axios from "axios";

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();

  const [street, setStreet] = useState("");
  const [block, setBlock] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

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

    const items = cart.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    try {
      await axios.post(
        "/api/orders",
        { items },
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

  return (
    <section className="page">
      <h2>Checkout</h2>

      <div className="checkout-layout">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h3>Shipping address</h3>

          <label htmlFor="street">Street</label>
          <input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />

          <label htmlFor="block">Block / Unit</label>
          <input id="block" value={block} onChange={(e) => setBlock(e.target.value)} />

          <label htmlFor="city">City</label>
          <input id="city" value={city} onChange={(e) => setCity(e.target.value)} />

          <label htmlFor="postal">Postal code</label>
          <input id="postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />

          {error && <p className="form-error">{error}</p>}

          <button className="btn" type="submit">Place order</button>
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