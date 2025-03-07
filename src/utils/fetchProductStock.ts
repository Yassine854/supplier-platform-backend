import axios from 'axios';
import ProductStock from '../model/product_stock';

interface Warehouse {
  id: number;
  website_id: number;
  code: string;
}

interface ProductResponse {
  id: number;
  sku: string;
  price: number;
  extension_attributes: {
    website_ids: number[];
    stock_item?: {
      qty: number;
    };
  };
}

const fetchProductStock = async (): Promise<void> => {
  try {
    // 1. Fetch warehouses and create website_id mapping
    const warehousesRes = await axios.get<Warehouse[]>(
      'https://uat.kamioun.com/rest/default/V1/store/storeViews',
      { headers: { Authorization: `Bearer pd2as4cqycmj671bga4egknw2csoa9b6` } }
    );

    // Create mapping of website_id to warehouse details
    const warehouseMap = new Map<number, { store_id: number; code: string }>();
    warehousesRes.data.forEach(w => {
      warehouseMap.set(w.website_id, { store_id: w.id, code: w.code });
    });

    // 2. Fetch products with necessary fields
    const productsRes = await axios.get<{ items: ProductResponse[] }>(
      'https://uat.kamioun.com/rest/default/V1/products?' + 
      'searchCriteria[currentPage]=1&' +
      'searchCriteria[pageSize]=100&' +
      'fields=items[id,sku,price,extension_attributes[website_ids,stock_item]]',
      { headers: { Authorization: `Bearer pd2as4cqycmj671bga4egknw2csoa9b6` } }
    );

    // 3. Process products and stock data
    const stockData = productsRes.data.items.map(product => {
      const websiteIds = product.extension_attributes.website_ids || [];
      const baseQty = product.extension_attributes.stock_item?.qty || 0;

      const stockEntries = websiteIds
        .map(websiteId => {
          const warehouse = warehouseMap.get(websiteId);
          return warehouse ? {
            store_id: warehouse.store_id,
            quantity: baseQty,
            price: product.price
          } : null;
        })
        .filter(Boolean) as Array<{ store_id: number; quantity: number; price: number }>;

      return {
        product_id: product.id,
        stock: stockEntries
      };
    });

    // 4. Prepare database operations
    const operations = stockData.map(data => ({
      updateOne: {
        filter: { product_id: data.product_id },
        update: {
          $set: { stock: data.stock },
          $setOnInsert: { product_id: data.product_id }
        },
        upsert: true
      }
    }));

    // 5. Execute bulk write
    await ProductStock.bulkWrite(operations);
    console.log(`✅ Updated stock for ${operations.length} products`);

  } catch (error) {
    console.error('❌ Stock fetch failed:', error);
    throw error;
  }
};

export default fetchProductStock;