import { Link } from "wouter";
import { useCart } from "../ShopCart";

export default function Cart() {
  const { cart, removeFromCart, getCartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <section className="page">
        <h2>Your bag</h2>
        <p>Your bag is empty.</p>
        <Link href="/shop" className="btn">Continue shopping</Link>
      </section>
    );
  }

  return (
    <section className="page">
      <h2>Your bag</h2>

      <div className="cart-list">
        {cart.map((item) => (
          <div className="cart-item" key={item.variantId}>
            <img src={item.image} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{item.color} / {item.size}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
            <div className="cart-right">
              <p className="price">${item.price * item.quantity}</p>
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.variantId)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="cart-total">Total: ${getCartTotal()}</p>
    </section>
  );
}