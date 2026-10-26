import { Link, useSearch } from "wouter";
import ProductCard from "../ProductCard";
import { products } from "../data/products";

const categories = [
  { name: "All", slug: "" },
  { name: "Shirts", slug: "shirts" },
  { name: "Caps", slug: "caps" },
  { name: "Jackets", slug: "jackets" },
  { name: "Cargo Pants", slug: "cargo" },
  { name: "Customized Uniforms", slug: "uniforms" },
];

export default function Shop() {
  const search = useSearch();
  const category = new URLSearchParams(search).get("category") || "";

  const visible = category
    ? products.filter((p) => p.Category.slug === category)
    : products;

  return (
    <section className="page">
      <h2>Shop</h2>

      <div className="filter-row">
        {categories.map((c) => (
          <Link
            key={c.name}
            href={c.slug ? `/shop?category=${c.slug}` : "/shop"}
            className={c.slug === category ? "filter-pill active" : "filter-pill"}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="product-grid">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {visible.length === 0 && <p>No products in this category yet.</p>}
    </section>
  );
}