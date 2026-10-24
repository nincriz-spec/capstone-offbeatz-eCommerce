import { useSearch } from "wouter";
import ProductCard from "../ProductCard";

const products = [
  {
    id: 1,
    name: "Oversized Heavy Tee",
    price: 25,
    fit: "oversized",
    Category: { name: "Shirts", slug: "shirts" },
    images: [{ url: "/products/tee.jpg" }],
    variants: [
      { id: 1, size: "L", color: "Black",  stockQty: 10 },
      { id: 2, size: "M", color: "Black", stockQty: 5},
      { id: 3, size: "S", color: "Black", stockQty: 5},
      { id: 4, size: "L", color: "White", stockQty: 4},
      { id: 5, size: "M", color: "White", stockQty: 8},
      { id: 6, size: "S", color: "White", stockQty: 5},
    ],
  },
  {
    id: 2,
    name: "Boxy Graphic Tee",
    price: 799,
    fit: "boxy",
    Category: { name: "Shirts", slug: "shirts" },
    images: [{ url: "/products/tee2.jpg" }],
    variants: [
      { id: 3, size: "M", color: "White" },
      { id: 4, size: "XL", color: "White" },
    ],
  },
  {
    id: 3,
    name: "Trucker Cap",
    price: 450,
    fit: "regular",
    Category: { name: "Caps", slug: "caps" },
    images: [{ url: "/products/cap.jpg" }],
    variants: [{ id: 5, size: "One size", color: "Black" }],
  },
];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const visible = category
    ? products.filter((p) => p.Category.slug === category)
    : products;

  return (
    <section className="page">
      <h2>Shop</h2>

      <div className="product-grid">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {visible.length === 0 && <p>No products in this category yet.</p>}
    </section>
  );
}