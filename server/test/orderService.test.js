
jest.mock('../data/orderData', () => ({
  getVariantById: jest.fn(),
  createOrder: jest.fn(),
  getOrdersByCustomer: jest.fn(),
  getOrderItemsByCustomer: jest.fn(),
  cancelOrder: jest.fn(),
}));

const orderData = require('../data/orderData');
const orderService = require('../services/orderService');

const goodAddress = { street: '1 Main St', block: '12B', city: 'Manila', postalCode: '1000' };

beforeEach(() => {
  jest.clearAllMocks();

  orderData.getVariantById.mockResolvedValue({ variant_id: 5, price: '25.00', stock_qty: 10 });
  orderData.createOrder.mockResolvedValue(99);
});

describe('orderService.createOrder: validation', () => {
  test('rejects an empty cart', async () => {
    await expect(orderService.createOrder(1, [], goodAddress)).rejects.toThrow('Cart is empty');
  });

  test('rejects items that are not a list', async () => {
    await expect(orderService.createOrder(1, 'abc', goodAddress)).rejects.toThrow('Cart is empty');
  });

  test('rejects a missing address', async () => {
    await expect(
      orderService.createOrder(1, [{ variantId: 5, quantity: 1 }], null)
    ).rejects.toThrow('Please enter a full address');
  });

  test('rejects an address with a missing field', async () => {
    await expect(
      orderService.createOrder(1, [{ variantId: 5, quantity: 1 }], { ...goodAddress, city: '' })
    ).rejects.toThrow('Please enter a full address');
  });

  test('rejects a quantity of 0, a negative quantity and a decimal', async () => {
    for (const quantity of [0, -2, 1.5, 'abc']) {
      await expect(
        orderService.createOrder(1, [{ variantId: 5, quantity }], goodAddress)
      ).rejects.toThrow('Quantity must be a whole number of at least 1');
    }
  });

  test('nothing is saved when the input is invalid', async () => {
    await expect(orderService.createOrder(1, [], goodAddress)).rejects.toThrow();
    expect(orderData.createOrder).not.toHaveBeenCalled();
  });
});

describe('orderService.createOrder: items and stock', () => {
  test('rejects a variant that does not exist', async () => {
    orderData.getVariantById.mockResolvedValue(undefined);

    await expect(
      orderService.createOrder(1, [{ variantId: 404, quantity: 1 }], goodAddress)
    ).rejects.toThrow('Item not found');
  });

  test('rejects when there is not enough stock', async () => {
    await expect(
      orderService.createOrder(1, [{ variantId: 5, quantity: 11 }], goodAddress)
    ).rejects.toThrow('Not enough stock');
    expect(orderData.createOrder).not.toHaveBeenCalled();
  });

  test('allows buying exactly the stock that is left', async () => {
    const result = await orderService.createOrder(1, [{ variantId: 5, quantity: 10 }], goodAddress);

    expect(result.total).toBe(250);
  });
});

describe('orderService.createOrder: price and result', () => {
  test('uses the price from the database, not from the browser', async () => {
    // the browser tries to send its own price: it must be ignored
    const result = await orderService.createOrder(
      1,
      [{ variantId: 5, quantity: 2, price: 1 }],
      goodAddress
    );

    expect(result).toEqual({ orderId: 99, total: 50 });
    expect(orderData.createOrder).toHaveBeenCalledWith(
      1,
      goodAddress,
      50,
      [{ variantId: 5, quantity: 2, unitPrice: 25 }]
    );
  });

  test('adds up two lines of the same variant into one line', async () => {
    const result = await orderService.createOrder(
      1,
      [{ variantId: 5, quantity: 1 }, { variantId: 5, quantity: 2 }],
      goodAddress
    );

    expect(result.total).toBe(75);
    expect(orderData.getVariantById).toHaveBeenCalledTimes(1);
  });

  test('adds up the total of different variants', async () => {
    orderData.getVariantById.mockImplementation(async (id) =>
      id == 5
        ? { variant_id: 5, price: '25.00', stock_qty: 10 }
        : { variant_id: 6, price: '10.50', stock_qty: 10 }
    );

    const result = await orderService.createOrder(
      1,
      [{ variantId: 5, quantity: 1 }, { variantId: 6, quantity: 2 }],
      goodAddress
    );

    expect(result.total).toBe(46);
  });
});

describe('orderService.getOrders and cancelOrder', () => {
  test('puts each order\'s items inside that order', async () => {
    orderData.getOrdersByCustomer.mockResolvedValue([{ order_id: 1 }, { order_id: 2 }]);
    orderData.getOrderItemsByCustomer.mockResolvedValue([
      { order_id: 1, name: 'Tee' },
      { order_id: 1, name: 'Cap' },
      { order_id: 2, name: 'Jacket' },
    ]);

    const result = await orderService.getOrders(7);

    expect(result[0].items).toHaveLength(2);
    expect(result[1].items).toEqual([{ order_id: 2, name: 'Jacket' }]);
  });

  test('cancelOrder passes the order id first and the customer id second', async () => {
    orderData.cancelOrder.mockResolvedValue();

    const result = await orderService.cancelOrder(7, 33);

    expect(orderData.cancelOrder).toHaveBeenCalledWith(33, 7);
    expect(result).toEqual({ message: 'Order cancelled' });
  });
});