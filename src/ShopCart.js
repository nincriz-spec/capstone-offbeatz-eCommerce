import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Saved in the browser under the name "cart", so it survives a refresh.
// getOnInit: read the saved cart straight away, so the bag is not empty for a split second.
const cartAtom = atomWithStorage("cart", [], undefined, { getOnInit: true });

export function useCart() {
    const [cart, setCart] = useAtom(cartAtom);

    function addToCart(item) {
        const index = cart.findIndex((i) => i.variantId === item.variantId);

        if (index === -1) {
            setCart([...cart, { ...item, quantity: 1 }]);
        } else {
            const updated = { ...cart[index], quantity: cart[index].quantity + 1 };
            setCart(cart.with(index, updated));
        }
    }

    function removeFromCart(variantId) {
        setCart(cart.filter((i) => i.variantId !== variantId));
    }

    function getCartTotal() {
        let total = 0;
        for (const item of cart) {
            total += item.price * item.quantity;
        }
        return total;
    }

    function modifyQuantity(variantId, newQuantity) {
        if (newQuantity < 1) {
            removeFromCart(variantId);
            return;
        }
        const index = cart.findIndex((i) => i.variantId === variantId);
        const updated = { ...cart[index], quantity: newQuantity };
        setCart(cart.with(index, updated));
    }

    function clearCart() {
        setCart([]);
    }

    return { cart, addToCart, removeFromCart, modifyQuantity, getCartTotal, clearCart };
}