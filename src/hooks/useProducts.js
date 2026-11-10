import { useState, useEffect } from 'react';
import axios from 'axios';

// filters is optional: { search, minPrice, maxPrice, fit, gender, category }
// Calling useProducts() with no filters works exactly as before.
export function useProducts(filters = {}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // A new object is created on every render, so we watch its text form instead.
    const filterKey = JSON.stringify(filters);

    useEffect(() => {
        setLoading(true);
        axios.get('/api/products', { params: JSON.parse(filterKey) })
            .then((res) => setProducts(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [filterKey]);

    return { products, loading };
}