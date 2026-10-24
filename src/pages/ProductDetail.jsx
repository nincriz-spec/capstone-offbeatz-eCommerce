import { useParams } from "wouter";

export default function ProductDetail() {
  const { id } = useParams();

  return (
    <section className="page">
      <h2>Product page</h2>
      <p>You opened product number {id}</p>
    </section>
  );
}