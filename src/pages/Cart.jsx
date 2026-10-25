import { Link } from "wouter";
import { useCart } from "../CartContext";

export default function Cart() {
  const { cart } = useCart();

  if (cart.length === 0) {
    return (
      <section className="page">
        <h2>Your bag</h2>
        <p>Your bag is empty.</p>
        <Link href="/shop" className="btn">Continue shopping</Link>
      </section>
    );
  }

  let total = 0;
  for (const item of cart) {
    total += item.price;
  }

  return (
    <section className="page">
      <h2>Your bag</h2>

      <div className="cart-list">
        {cart.map((item, index) => (
          <div className="cart-item" key={index}>
            <img src={item.image} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{item.color} / {item.size}</p>
            </div>
            <p className="price">${item.price}</p>
          </div>
        ))}
      </div>

      <p className="cart-total">Total: ${total}</p>
    </section>
  );
}