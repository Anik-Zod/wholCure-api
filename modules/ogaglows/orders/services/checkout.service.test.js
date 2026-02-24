import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const { checkoutPreviewService } = await import('./checkout.service.js');
const Product = (await import('../../products/product.model.js')).default;
const Coupon = (await import('../../products/coupon/coupon.model.js')).default;

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
  await Coupon.deleteMany({});
});

describe('checkout service', () => {
  it('returns both product and coupon discounts in the breakdown', async () => {
    // set up a discounted product
    const prod = await Product.create({
      name: 'Promo Item',
      description: 'foo',
      price: 200,
      category: 'skin-care',
      images: [{ public_id: 'a', url: 'http://example.com/a' }],
      countInStock: 5,
      discount: { isActive: true, type: 'percentage', value: 50 }, // finalPrice 100
    });

    const coupon = await Coupon.create({
      code: 'HALF',
      discountType: 'percentage',
      value: 10, // 10% off after item discounts
      isActive: true,
    });

    const preview = await checkoutPreviewService({
      orderItems: [{ product: prod._id, quantity: 2 }],
      couponCode: 'half',
      shippingPrice: 0,
      taxPrice: 0,
    });

    expect(preview.priceBreakdown.itemsPrice).toBe(200); // 100 * 2
    expect(preview.priceBreakdown.productDiscount).toBe(200); // saved 100 per item
    expect(preview.priceBreakdown.discountAmount).toBe(20); // 10% of 200
    expect(preview.priceBreakdown.totalPrice).toBe(180); // 200 - 20
  });

  it('handles cart without coupon gracefully', async () => {
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
    expect(preview.priceBreakdown.totalPrice).toBe(57); // 50+5+2
  });
});
