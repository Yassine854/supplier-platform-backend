import mongoose, { Schema, Document } from 'mongoose';

// Define the Warehouse interface
export interface IWarehouse extends Document {
  warehouseId: number;
  websiteId: number;
  code: string;
  name: string;
}

// Define Schema for Warehouse
const WarehouseSchema = new Schema<IWarehouse>(
  {
    warehouseId: { type: Number, required: true, unique: true },
    websiteId: { type: Number, required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  { versionKey: false }
);

// Export the Warehouse model
export default mongoose.model<IWarehouse>('Warehouse', WarehouseSchema, 'Warehouse');

