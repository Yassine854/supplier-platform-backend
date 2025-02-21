import { faker } from '@faker-js/faker';
import Product from '../model/product.modal';
import Ads from '../model/ad.modal';
import mongoose from 'mongoose';
import { adStatus, adType } from '../types/ad.types';
export async function seedProducts() {
  try {
    await Product.deleteMany({});
    await Ads.deleteMany({});
    console.log('Existing products cleared.');

    const products = [];
    const ads = [];
    for (let i = 0; i < 15; i++) {
      products.push({
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
        productIdMagento: '554',
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
      ads.push({
        title: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        imageUrl: ['/wysiwyg/Flouci_Banner.png'],
        adType: faker.helpers.arrayElement(Object.values(adType)),
        clickUrl: 'Cart',
        status: faker.helpers.arrayElement(Object.values(adStatus)),
        startDate: faker.date.future(),
        endDate: faker.date.future(),
        product: new mongoose.Types.ObjectId(),
        screen: 'test',
        position: faker.number.int({ min: 1, max: 2 }),
      });
    }

    await Product.insertMany(products);
    await Ads.insertMany(ads);
    console.log('Fake products inserted successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}
