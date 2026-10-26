import { Route, Switch } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import FlashMessage from "./FlashMessage";
import "./App.css";

function App() {
    return (
        <>
            <Header />

            <Switch>
                <Route path="/" component={Home} />
                <Route path="/shop" component={Shop} />
                <Route path="/product/:id"><ProductDetail /></Route>
                <Route path="/cart"><Cart /></Route>
                <Route path="/login"><Login /></Route>
                <Route path="/register"><Register /></Route>
                <Route path="/checkout"><Checkout /></Route>
            </Switch>

            <FlashMessage />

            <Footer />
        </>
    );
}

export default App;