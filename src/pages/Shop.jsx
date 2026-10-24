import ProductCard from "../ProductCard";
import { products } from "../data/products";

export default function Shop() {
  return (
    <section className="page">
      <h2>Shop</h2>

      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}