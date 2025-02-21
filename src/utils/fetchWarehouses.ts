import axios from 'axios';
import Warehouse, { IWarehouse } from '../model/warehouse';

const fetchAndStoreWarehouses = async (): Promise<void> => {
  try {
    const response = await axios.get(
      'https://uat.kamioun.com/rest/default/V1/store/storeViews?fields=id,website_id,name',
      {
        headers: { Authorization: `Bearer pd2as4cqycmj671bga4egknw2csoa9b6` }
      }
    );

    const warehouses: IWarehouse[] = response.data;

    if (!warehouses || warehouses.length === 0) {
      console.log('⚠️ No warehouses found.');
      return;
    }

    // ✅ Insert/update warehouses efficiently
    await Warehouse.bulkWrite(
      warehouses.map((warehouse) => ({
        updateOne: {
          filter: { id: warehouse.id },
          update: { $set: warehouse },
          upsert: true
        }
      }))
    );

    console.log('✅ Warehouses stored successfully.');
  } catch (error) {
    console.error('❌ Error fetching/storing warehouses:', error);
  }
};

export default fetchAndStoreWarehouses;
