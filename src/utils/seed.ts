import { faker } from '@faker-js/faker';
import Product from '../model/product.modal';
import Ads from '../model/ad.modal';
import mongoose from 'mongoose';
import { adStatus, adType } from '../types/ad.types';
export async function seedProducts() {
  try {
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    const products = [];
    for (let i = 0; i < 15; i++) {
      products.push({
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
        productIdMagento: faker.string.uuid(),
        special_price:
          Math.random() > 0.5
            ? parseFloat(faker.commerce.price({ min: 5, max: 300 }))
            : undefined,
        productName: faker.commerce.productName(),
        costPrice: parseFloat(faker.commerce.price({ min: 5, max: 300 })),
        qty: faker.number.int({ min: 1, max: 100 }),
        min_qty: faker.number.int({ min: 0, max: 5 }),
        is_qty_decimal: faker.datatype.boolean(),
        is_in_stock: faker.datatype.boolean(),
        qty_increments: faker.helpers.arrayElement([0.5, 1, 2, 5]),
      });
     
      
    }

    await Product.insertMany(products);
    console.log('Fake products inserted successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}
