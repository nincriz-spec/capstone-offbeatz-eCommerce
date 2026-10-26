import { Link } from "wouter";
import Hero from "../Hero";
import ProductCard from "../ProductCard";
import { products } from "../data/products";

const categories = [
  { name: "Shirts", slug: "shirts", image: "/categories/OB Tee 1.jpg" },
  { name: "Caps", slug: "caps", image: "/categories/cap.jpg" },
  { name: "Jackets", slug: "jackets", image: "/categories/jacket003.jpg" },
  { name: "Cargo Pants", slug: "cargo pants", image: "/categories/cargopants.jpg" },
  { name: "Customized Uniforms", slug: "customized uniforms", image: "/categories/argentina.jpg" },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="page">
        <h2>Shop by category</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" key={category.name}>
              <img src={category.image} alt={category.name} />
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
        <section className="page" id="drop">
          <h2>Latest drop</h2>
          <div className="product-grid">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="page" id="story">
          <h2>Our story</h2>
          <p className="about-text">
            Offbeatz started with two friends, a shared dream, and the belief that we could create something of our own. 
            What began as an idea between us grew into a journey of taking risks, learning along the way, and building something we truly believe in. 
            To us, “Built Different” means staying true to ourselves, embracing what makes us unique, and proving that with passion, trust, 
            and a little bit of courage, two friends can turn a dream into reality.
          </p>
        </section>

        <section className="page" id="contact">
          <h2>Contact</h2>
          <p>
            Instagram:{" "}
            <a href="https://instagram.com/offbeatzapparel" target="_blank" rel="noreferrer">
              @offbeatzapparel
            </a>
          </p>
          <p>Facebook: Offbeatz Apparel</p>
          <p>Email: crixel33@gmail.com</p>
        </section>
      </section>
    </>
  );
}