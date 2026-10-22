import Header from "./Header";
import Hero from "./Hero";
import Footer from "./Footer";
import "./App.css";

const categories = [
    { name: "Shirts", image: "/categories/OB Tee 1.jpg" },
    { name: "Caps", image: "/categories/cap.jpg" },
    { name: "Jackets", image: "/categories/jacket003.jpg" },
    { name: "Cargo Pants", image: "/categories/cargopants.jpg" },
    { name: "Customized Uniforms", image: "/categories/argentina.jpg" },
];

function App() {
    return (
        <>
            <Header />
            <Hero />

            <section className="page">
                <h2>Shop by category</h2>
                <div className="category-grid">
                    {categories.map((category) => (
                        <div className="category-card" key={category.name}>
                            <img src={category.image} alt={category.name} />
                            <span>{category.name}</span>
                        </div>
                    ))}
                </div>
                <div className="hero-content">
                    <a href="#" className="btn">Shop the drop</a>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default App;