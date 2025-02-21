import mongoose, { Schema, Document } from 'mongoose';

// Define the Warehouse interface
export interface IWarehouse extends Document {
  id: number;
  website_id: number;
  name: string;
}

// Define Schema for Warehouse
const WarehouseSchema = new Schema<IWarehouse>({
  id: { type: Number, required: true, unique: true },
  website_id: { type: Number, required: true },
  name: { type: String, required: true },
},{ versionKey: false });

// Export the Warehouse model
export default mongoose.model<IWarehouse>('Warehouse', WarehouseSchema,'Warehouse');
