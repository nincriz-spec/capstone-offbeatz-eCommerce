import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "./ShopCart";
import "./Header.css";

export default function Header() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);

  let count = 0;
  for (const item of cart) {
    count += item.quantity;
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">OFFBEATZ</Link>

        <nav className={open ? "nav open" : "nav"}>
          <Link href="/shop" onClick={() => setOpen(false)}>Shop</Link>
          <a href="#drop">Drop</a>
          <a href="#story">Story</a>
          <a href="#contact">Contact</a>
          <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
        </nav>

        <Link href="/cart" className="bag">Bag ({count})</Link>

        <button className="menu-toggle" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>
    </header>
  );
}