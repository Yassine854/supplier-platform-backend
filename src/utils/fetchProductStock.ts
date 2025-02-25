import axios from 'axios';
import ProductStock from '../model/product_stock';

const fetchProductStock = async (): Promise<void> => {
  try {
    // 1. Get all warehouses
    const warehouses = await axios.get(
      'https://uat.kamioun.com/rest/default/V1/store/storeViews',
      {
        headers: { Authorization: `Bearer pd2as4cqycmj671bga4egknw2csoa9b6` }
      }
    );

    // 2. Fetch stock from each warehouse
    const warehouseStock = await Promise.all(
      warehouses.data.map(async (warehouse: any) => {
        try {
          const response = await axios.get(
            `https://uat.kamioun.com/rest/${warehouse.code}/V1/products?fields=items[sku,extension_attributes[stock_item]]`,
            {
              headers: { Authorization: `Bearer pd2as4cqycmj671bga4egknw2csoa9b6` }
            }
          );

          return response.data.items.map((item: any) => ({
            sku: item.sku,
            warehouse: warehouse.code,
            quantity: item.extension_attributes?.stock_item?.qty || 0
          }));
        } catch (error) {
          console.error(`Failed to fetch ${warehouse.code} stock:`, error);
          return [];
        }
      })
    );

    // 3. Group stock by SKU
    const stockBySku = warehouseStock.flat().reduce((acc: any, item) => {
      if (!acc[item.sku]) {
        acc[item.sku] = [];
      }
      acc[item.sku].push({
        warehouseCode: item.warehouse,
        quantity: item.quantity
      });
      return acc;
    }, {});

    // 4. Save to database
    const operations = Object.entries(stockBySku).map(([sku, stocks]) => ({
      updateOne: {
        filter: { sku },
        update: {
          $set: { stocks },
          $setOnInsert: { sku }
        },
        upsert: true
      }
    }));

    await ProductStock.bulkWrite(operations);
    console.log(`✅ Updated stock for ${operations.length} products`);

  } catch (error) {
    console.error('❌ Stock fetch failed:', error);
    throw error;
  }
};

export default fetchProductStock;