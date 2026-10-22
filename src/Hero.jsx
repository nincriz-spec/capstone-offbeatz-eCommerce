import { Link } from "react-router-dom";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <img
        src="/hero.jpg"
        alt="Offbeatz Built Different campaign"
        className="hero-image"
      />
      <div className="hero-content">
        <Link to="/shop" className="btn">Shop the drop</Link>
      </div>
    </section>
  );
}