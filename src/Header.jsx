import { Link } from "wouter";
import { useCart } from "./CartContext";
import "./Header.css";

export default function Header() {
  const { cart } = useCart();

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

       <Link href="/cart" className="bag">Bag ({cart.length})</Link>
      </div>
    </header>
  );
}