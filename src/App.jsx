import { Route, Switch } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import "./App.css";

function App() {
    return (
        <>
            <Header />

            <Switch>
                <Route path="/" component={Home} />
                <Route path="/shop" component={Shop} />
                <Route path="/product/:id"><ProductDetail /></Route>
            </Switch>



            <Footer />
        </>
    );
}

export default App;