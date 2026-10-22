import Hero from "../Hero";

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
      </section>
    </>
  );
}