import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import SiteFooter from "./Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import "./App.css";

function App() {
    return (
        <>
            <Header />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
            </Routes>

            <SiteFooter />
        </>
    );
}

export default App;