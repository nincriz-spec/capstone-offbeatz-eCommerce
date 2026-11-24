
jest.mock('../data/productData', () => ({
  getAllProducts: jest.fn(),
  getAllVariant: jest.fn(),
  getAllProductImage: jest.fn(),
}));

const productData = require('../data/productData');
const productService = require('../services/productService');

beforeEach(() => {
  jest.clearAllMocks();
  productData.getAllProducts.mockResolvedValue([]);
  productData.getAllVariant.mockResolvedValue([]);
  productData.getAllProductImage.mockResolvedValue([]);
});

describe('productService.getAllProducts: filters', () => {
  test('passes valid filters down to the data layer (cleaned)', async () => {
    await productService.getAllProducts({
      search: '  tee ',
      minPrice: '10',
      maxPrice: '50',
      fit: 'slim',
      gender: 'women',
      category: 'Shirts',
    });

    expect(productData.getAllProducts).toHaveBeenCalledWith({
      search: 'tee',
      minPrice: 10,
      maxPrice: 50,
      fit: 'slim',
      gender: 'women',
      category: 'shirts',
    });
  });

  test('ignores filters that are not valid', async () => {
    await productService.getAllProducts({
      search: 'x'.repeat(101),
      minPrice: 'abc',
      maxPrice: '999999',
      fit: 'huge',
      gender: 'alien',
      category: 'shirts; DROP TABLE product',
    });

    expect(productData.getAllProducts).toHaveBeenCalledWith({});
  });

  test('keeps a minimum price of 0', async () => {
    await productService.getAllProducts({ minPrice: '0' });

    expect(productData.getAllProducts).toHaveBeenCalledWith({ minPrice: 0 });
  });

  test('works when no filters are sent at all', async () => {
    await productService.getAllProducts();

    expect(productData.getAllProducts).toHaveBeenCalledWith({});
  });
});

describe('productService.getAllProducts: result', () => {
  test('returns an empty list when there are no products', async () => {
    const result = await productService.getAllProducts({});

    expect(result).toEqual([]);
  });

  test('puts the matching variants, images and category inside each product', async () => {
    productData.getAllProducts.mockResolvedValue([
      { product_id: 1, name: 'Tee', price: 20, category_name: 'Shirts', category_slug: 'shirts' },
      { product_id: 2, name: 'Cap', price: 15, category_name: 'Caps', category_slug: 'caps' },
    ]);
    productData.getAllVariant.mockResolvedValue([
      { variant_id: 11, product_id: 1, size: 'M', color: 'black', set_name: null },
      { variant_id: 21, product_id: 2, size: 'One size', color: 'white', set_name: null },
    ]);
    productData.getAllProductImage.mockResolvedValue([
      { product_id: 1, url: 'tee.jpg', color: 'black' },
    ]);

    const result = await productService.getAllProducts({});

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].Category).toEqual({ name: 'Shirts', slug: 'shirts' });
    expect(result[0].variants).toHaveLength(1);
    expect(result[0].variants[0].id).toBe(11);
    expect(result[0].images).toEqual([{ product_id: 1, url: 'tee.jpg', color: 'black' }]);
    // the cap has a variant but no image
    expect(result[1].variants[0].id).toBe(21);
    expect(result[1].images).toEqual([]);
  });
});