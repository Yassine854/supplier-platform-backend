import axios from 'axios';
import Order, { IOrder } from '../model/order.model';

const fetchAndStoreAllOrders = async (): Promise<void> => {
  try {
    let currentPage = 1;
    const pageSize = 100; // Max recommended page size for Magento
    let hasMore = true;
    let totalFetched = 0;

    const maxPages = 80; // ⬅️

    while (hasMore && currentPage <= maxPages) {
      console.log(`🔹 Fetching page ${currentPage}...`);

      const response = await axios.get(
        `https://uat.kamioun.com/rest/default/V1/orders`,
        {
          headers: { Authorization: `Bearer pd2as4cqycmj671bga4egknw2csoa9b6` },
          params: {
            'searchCriteria[currentPage]': currentPage,
            'searchCriteria[pageSize]': pageSize,
            'searchCriteria[sortOrders][0][field]': 'created_at',
            'searchCriteria[sortOrders][0][direction]': 'DESC',
            'fields':
              'items[entity_id,state,status,base_grand_total,created_at,updated_at,customer_id,discount_amount,store_id,items[item_id,order_id,product_id,name,qty_invoiced,row_total_incl_tax,qty_refunded,amount_refunded]]'
          }
        }
      );

      const orders: IOrder[] = response.data.items;
      const normalizedOrders = orders.map((order) => ({
        ...order,
        items: (order.items || []).map((item) => ({
          ...item,
          qty_refunded: item?.qty_refunded == null ? 0 : item.qty_refunded
        }))
      }));

      if (!orders || orders.length === 0) {
        console.log('⚠️ No more orders to fetch.');
        hasMore = false;
        break;
      }

      console.log(`📦 Fetched ${orders.length} orders from page ${currentPage}.`);

      await Order.bulkWrite(
        normalizedOrders.map((order) => ({
          updateOne: {
            filter: { entity_id: order.entity_id },
            update: { $set: order },
            upsert: true
          }
        }))
      );

      totalFetched += orders.length;
      console.log(`✅ Stored ${orders.length} orders from page ${currentPage}. Total so far: ${totalFetched}`);

      currentPage++;
    }

    console.log(`🎉 Fetched up to ${maxPages} pages. Total orders: ${totalFetched}`);
  } catch (error) {
    console.error('❌ Error fetching/storing orders:', error);
  }
};

export default fetchAndStoreAllOrders;
