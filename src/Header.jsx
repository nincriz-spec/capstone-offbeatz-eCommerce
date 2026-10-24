import { Link } from "wouter";
import "./Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
       <Link to="/" className="brand">OFFBEATZ</Link>

        <nav className="nav">
          <Link to="/shop">Shop</Link>
          <Link to="#drop">Drop</Link>
          <Link to="#story">Story</Link>
          <Link to="#contact">Contact</Link>
        </nav>

        <a href="#" className="bag">Bag</a>
      </div>
    </header>
  );
}