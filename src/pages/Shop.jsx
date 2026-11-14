import { useState, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import ProductCard from "../ProductCard";
import { useProducts } from "../hooks/useProducts";

const categories = [
  { name: "All", slug: "" },
  { name: "Shirts", slug: "shirts" },
  { name: "Caps", slug: "caps" },
  { name: "Jackets", slug: "jackets" },
  { name: "Cargo Pants", slug: "cargo" },
  { name: "Customized Uniforms", slug: "uniforms" },
];

const FITS = ["oversized", "boxy", "regular", "slim"];
const GENDERS = ["men", "women", "unisex"];

// Every filter the page understands
const FILTER_NAMES = ["category", "search", "fit", "gender", "minPrice", "maxPrice"];

export default function Shop() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);

  // Read the filters from the URL (only the ones that have a value)
  const filters = {};
  FILTER_NAMES.forEach((name) => {
    const value = params.get(name);
    if (value) {
      filters[name] = value;
    }
  });

  const { products, loading } = useProducts(filters);

  // The values typed in the filter bar. They start from the URL.
  const [form, setForm] = useState({});
  useEffect(() => {
    setForm({
      search: filters.search || "",
      fit: filters.fit || "",
      gender: filters.gender || "",
      minPrice: filters.minPrice || "",
      maxPrice: filters.maxPrice || "",
    });
  }, [search]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Apply: put the typed values into the URL, which reloads the products
  function handleSubmit(e) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (filters.category) {
      next.set("category", filters.category);
    }
    ["search", "fit", "gender", "minPrice", "maxPrice"].forEach((name) => {
      const value = (form[name] || "").trim();
      if (value) {
        next.set(name, value);
      }
    });
    const qs = next.toString();
    setLocation(qs ? `/shop?${qs}` : "/shop");
  }

  // A category link keeps the other filters
  function linkFor(slug) {
    const next = new URLSearchParams(search);
    if (slug) {
      next.set("category", slug);
    } else {
      next.delete("category");
    }
    const qs = next.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <section className="page">
      <h2>Shop</h2>

      <div className="filter-row">
        {categories.map((c) => (
          <Link
            key={c.name}
            href={linkFor(c.slug)}
            className={c.slug === (filters.category || "") ? "filter-pill active" : "filter-pill"}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="filter-form">
        <input
          type="text"
          name="search"
          placeholder="Search products"
          aria-label="Search products"
          value={form.search || ""}
          onChange={handleChange}
        />
        <select name="fit" aria-label="Fit" value={form.fit || ""} onChange={handleChange}>
          <option value="">Any fit</option>
          {FITS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select name="gender" aria-label="Gender" value={form.gender || ""} onChange={handleChange}>
          <option value="">Any gender</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input
          type="number"
          name="minPrice"
          min="0"
          placeholder="Min price"
          aria-label="Minimum price"
          value={form.minPrice || ""}
          onChange={handleChange}
        />
        <input
          type="number"
          name="maxPrice"
          min="0"
          placeholder="Max price"
          aria-label="Maximum price"
          value={form.maxPrice || ""}
          onChange={handleChange}
        />
        <button type="submit" className="filter-apply">Apply</button>
        <Link href="/shop" className="filter-pill">Clear</Link>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p>{hasFilters ? "No products match these filters." : "Upcoming soon."}</p>
      )}
    </section>
  );
}