import { useState, useEffect } from 'react';
import axios from 'axios';


export function useProducts(filters = {}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

 
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