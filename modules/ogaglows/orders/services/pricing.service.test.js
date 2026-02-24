import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// dynamic imports because the project uses ESM
const { calculateCartItems } = await import('./pricing.service.js');
const Product = (await import('../../products/product.model.js')).default;

let mongoServer;

beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('pricing service', () => {
  it('calculates cart items including discount fields', async () => {
    // product with 25% discount on 500 => finalPrice 375
    const prod = await Product.create({
      name: 'Discounted Item',
      description: 'test',
      price: 500,
      category: 'skin-care',
      images: [{ public_id: 'x', url: 'http://example.com/x' }],
      countInStock: 10,
      discount: { isActive: true, type: 'percentage', value: 25 },
    });

    const { validatedItems, itemsPrice, totalDiscount } = await calculateCartItems([
      { product: prod._id, quantity: 2 },
    ]);

    expect(validatedItems).toHaveLength(1);
    const line = validatedItems[0];

    // final per-unit price should be 375
    expect(line.price).toBe(375);
    expect(line.originalPrice).toBe(500);
    // saved per unit 125 * 2 = 250
    expect(line.discountAmount).toBe(250);
    // subtotal = 375 * 2
    expect(line.subtotal).toBe(750);

    expect(itemsPrice).toBe(750);
    expect(totalDiscount).toBe(250);
  });

  it('allows cart without discount and returns zero discountAmount', async () => {
    const prod = await Product.create({
      name: 'Plain Item',
      description: 'test',
      price: 100,
      category: 'skin-care',
      images: [{ public_id: 'y', url: 'http://example.com/y' }],
      countInStock: 5,
      discount: { isActive: false },
    });

    const { validatedItems, itemsPrice, totalDiscount } = await calculateCartItems([
      { product: prod._id, quantity: 3 },
    ]);

    expect(validatedItems[0].price).toBe(100);
    expect(validatedItems[0].originalPrice).toBe(100);
    expect(validatedItems[0].discountAmount).toBe(0);
    expect(itemsPrice).toBe(300);
    expect(totalDiscount).toBe(0);
  });

  it('throws when product missing or out of stock', async () => {
    await expect(calculateCartItems([{ product: new mongoose.Types.ObjectId(), quantity: 1 }])).rejects.toThrow();

    const prod = await Product.create({
      name: 'No Stock',
      description: 'test',
      price: 50,
      category: 'skin-care',
      images: [{ public_id: 'z', url: 'http://example.com/z' }],
      countInStock: 0,
      discount: { isActive: false },
    });

    await expect(calculateCartItems([{ product: prod._id, quantity: 1 }])).rejects.toThrow(/out of stock/i);
  });
});

// -----------------------------------------------------------------------------
// checkout preview integration tests (ensuring both discounts show up)
// -----------------------------------------------------------------------------

describe('checkout service', () => {
  let Coupon;
  let checkoutPreviewService;

  beforeAll(async () => {
    Coupon = (await import('../../products/coupon/coupon.model.js')).default;
    ({ checkoutPreviewService } = await import('./checkout.service.js'));
  });

  beforeEach(async () => {
    await Coupon.deleteMany({});
  });

  it('produces productDiscount and coupon discount in the price breakdown', async () => {
    const prod = await Product.create({
      name: 'Promo Item',
      description: 'foo',
      price: 200,
      category: 'skin-care',
      images: [{ public_id: 'a', url: 'http://example.com/a' }],
      countInStock: 5,
      discount: { isActive: true, type: 'percentage', value: 50 },
    });

    await Coupon.create({
      code: 'HALF',
      discountType: 'percentage',
      value: 10,
      isActive: true,
    });

    const preview = await checkoutPreviewService({
      orderItems: [{ product: prod._id, quantity: 2 }],
      couponCode: 'half',
      shippingPrice: 0,
      taxPrice: 0,
    });

    expect(preview.priceBreakdown.itemsPrice).toBe(200);
    expect(preview.priceBreakdown.productDiscount).toBe(200);
    expect(preview.priceBreakdown.discountAmount).toBe(20);
    expect(preview.priceBreakdown.totalPrice).toBe(180);
  });

  it('works when no coupon is provided', async () => {
    const prod = await Product.create({
      name: 'Plain',
      description: 'bar',
      price: 50,
      category: 'skin-care',
      images: [{ public_id: 'b', url: 'http://example.com/b' }],
      countInStock: 2,
      discount: { isActive: false },
    });

    const preview = await checkoutPreviewService({
      orderItems: [{ product: prod._id, quantity: 1 }],
      shippingPrice: 5,
      taxPrice: 2,
    });

    expect(preview.priceBreakdown.productDiscount).toBe(0);
    expect(preview.priceBreakdown.discountAmount).toBe(0);
    expect(preview.priceBreakdown.totalPrice).toBe(57);
  });
});

// -----------------------------------------------------------------------------
// shipping cost tests (model/service + http routes)
// -----------------------------------------------------------------------------

describe('shipping cost model/service', () => {
  let ShippingCost;
  let fetchShippingCost;
  let updateShippingCost;

  beforeAll(async () => {
    ShippingCost = (await import('../shipping.model.js')).default;
    ({ fetchShippingCost, updateShippingCost } = await import('../shipping.service.js'));
  });

  beforeEach(async () => {
    await ShippingCost.deleteMany({});
  });

  it('defaults to 250 and creates document', async () => {
    const cost = await fetchShippingCost();
    expect(cost).toBe(250);
    const docs = await ShippingCost.find();
    expect(docs).toHaveLength(1);
    expect(docs[0].value).toBe(250);
  });

  it('allows updating the shipping cost', async () => {
    await updateShippingCost(300);
    const cost = await fetchShippingCost();
    expect(cost).toBe(300);
    const doc = await ShippingCost.findOne();
    expect(doc.value).toBe(300);
  });

  it('throws for invalid values', async () => {
    await expect(updateShippingCost(-1)).rejects.toThrow();
    await expect(updateShippingCost(null)).rejects.toThrow();
  });
});

describe('shipping route', () => {
  let ShippingCost;
  let app;
  let request;

  beforeAll(async () => {
    ShippingCost = (await import('../shipping.model.js')).default;
    app = (await import("../../../../server.js")).default;
    request = (await import('supertest')).default;
  });

  beforeEach(async () => {
    await ShippingCost.deleteMany({});
  });

  it('GET /api/ogaglow/shipping returns default', async () => {
    const res = await request(app).get('/api/ogaglow/shipping');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.value).toBe(250);
  });

  it('PUT /api/ogaglow/shipping updates value', async () => {
    const res1 = await request(app).put('/api/ogaglow/shipping').send({ value: 400 });
    expect(res1.statusCode).toBe(200);
    expect(res1.body.value).toBe(400);

    const res2 = await request(app).get('/api/ogaglow/shipping');
    expect(res2.body.value).toBe(400);
  });

  it('PUT rejects bad payload', async () => {
    const res = await request(app).put('/api/ogaglow/shipping').send({ value: 'foo' });
    expect(res.statusCode).toBe(400);
  });
});
