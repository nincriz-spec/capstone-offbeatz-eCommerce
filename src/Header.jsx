import { Link } from "wouter";
import { useCart } from "./ShopCart";
import "./Header.css";

export default function Header() {
  const { cart } = useCart();

  let count = 0;
  for (const item of cart) {
    count += item.quantity;
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">OFFBEATZ</Link>

        <nav className="nav">
          <Link href="/shop">Shop</Link>
          <a href="#drop">Drop</a>
          <a href="#story">Story</a>
          <a href="#contact">Contact</a>
        </nav>

        <Link href="/cart" className="bag">Bag ({count})</Link>
      </div>
    </header>
  );
}