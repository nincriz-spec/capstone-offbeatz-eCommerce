import { useParams, Link } from "wouter";
import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../ShopCart";
import { useFlash } from "../FlashStore";


export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === Number(id));

  const variants = product ? product.variants : [];
  const colors = [...new Set(variants.map((v) => v.color))];
  const sizes = [...new Set(variants.map((v) => v.size))];
  const [pickedColor, setPickedColor] = useState(null);
  const [pickedSize, setPickedSize] = useState(null);
  const color = pickedColor || colors[0];
  const size = pickedSize || sizes[0];
  const { addToCart } = useCart();
  const { showMessage } = useFlash();

  if (loading) return <p>Loading...</p>;

  if (!product) {
    return (
      <section className="page">
        <h2>Product not found</h2>
        <Link href="/shop" className="btn">Back to shop</Link>
      </section>
    );
  }

  const image =
    product.images.find((img) => img.color === color) || product.images[0];

  const selected = variants.find(
    (v) => v.color === color && v.size === size
  );

  let stockMessage;
  if (!selected) {
    stockMessage = "stock unavailable";
  } else if (selected.stockQty === 0) {
    stockMessage = "Sold out";
  } else {
    stockMessage = `${selected.stockQty} in stock`;
  }

  const canAdd = selected && selected.stockQty > 0;

  function handleAdd() {
    addToCart({
      variantId: selected.id,
      name: product.name,
      price: product.price,
      color: selected.color,
      size: selected.size,
      image: image.url,
    });
      showMessage("Added to bag", "success");
  }

  return (
    <section className="page">
      <div className="detail-layout">
        <img src={image.url} alt={product.name} className="detail-image" />

        <div className="detail-info">
          <h2>{product.name}</h2>
          <p className="price">${product.price}</p>

          <h4>Color</h4>
          <div className="option-row">
            {colors.map((c) => (
              <button
                key={c}
                className={c === color ? "option-pill active" : "option-pill"}
                onClick={() => setPickedColor(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <h4>Size</h4>
          <div className="option-row">
            {sizes.map((s) => (
              <button
                key={s}
                className={s === size ? "option-pill active" : "option-pill"}
                onClick={() => setPickedSize(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <p className="stock">{stockMessage}</p>

          <button className="btn" disabled={!canAdd} onClick={handleAdd}>
            Add to bag
          </button>
        </div>
        
      </div>
    </section>
  );
}