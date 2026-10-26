import { atom, useAtom } from "jotai";

const cartAtom = atom([]);

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
    return { cart, addToCart, removeFromCart, modifyQuantity, getCartTotal };
}
