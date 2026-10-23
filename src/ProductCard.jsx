export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const sizes = [...new Set(product.variants.map((v) => v.size))];

  return (
    <div className="product-card">
      <img src={image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price}</p>
      <small>{product.fit} · {sizes.join(", ")}</small>
    </div>
  );
}