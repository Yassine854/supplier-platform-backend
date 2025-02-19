import mongoose, { Document, Schema } from 'mongoose';
import { Product, adStatus, adType } from '../types/ad.types';
type IProduct = Product & Document;
const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    productIdMagento: { type: String, required: true },
    special_price: { type: Number },
    productName: { type: String, required: true },
    costPrice: { type: Number, required: true },
    qty: { type: Number, required: true },
    min_qty: { type: Number, default: 0 },
    is_qty_decimal: { type: Boolean, default: false },
    is_in_stock: { type: Boolean, default: true },
    qty_increments: { type: Number, default: 0.5 },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model<IProduct>('Product', ProductSchema);
