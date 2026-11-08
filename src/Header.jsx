import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "./ShopCart";
import { useAuth } from "./AuthStore";
import { useFlash } from "./FlashStore";
import getRole from "./getRole";
import "./Header.css";

export default function Header() {
  const { cart } = useCart();
  const { isLoggedIn, token, logout } = useAuth();
  const { showMessage } = useFlash();
  const [open, setOpen] = useState(false);
  const [location, navigate] = useLocation();

  const isAdmin = isLoggedIn && getRole(token) === "admin";

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

  function handleLogout() {
    logout();
    setOpen(false);
    showMessage("Logged out", "success");
    navigate("/");
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

          {isLoggedIn ? (
            <>
              <Link href="/account" onClick={() => setOpen(false)}>My account</Link>
              {isAdmin && (
              <a href="/dashboard/login" onClick={() => setOpen(false)}>Admin</a>
              )}
              <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Log out</a>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
          )}
        </nav>

        <Link href="/cart" className="bag">Bag ({count})</Link>

        <button className="menu-toggle" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>
    </header>
  );
}