import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "./ShopCart";
import "./Header.css";

export default function Header() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const [location, navigate] = useLocation();

  let count = 0;
  for (const item of cart) {
    count += item.quantity;
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function goToSection(e, id) {
    e.preventDefault();
    setOpen(false);

    if (location === "/") {
      scrollToSection(id);
    } else {
      navigate("/");
      setTimeout(() => scrollToSection(id), 100);
    }
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">OFFBEATZ</Link>

        <nav className={open ? "nav open" : "nav"}>
          <Link href="/shop" onClick={() => setOpen(false)}>Shop</Link>
          <a href="/#drop" onClick={(e) => goToSection(e, "drop")}>Drop</a>
          <a href="/#story" onClick={(e) => goToSection(e, "story")}>Story</a>
          <a href="/#contact" onClick={(e) => goToSection(e, "contact")}>Contact</a>
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