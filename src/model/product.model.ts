import mongoose, { Document, Schema } from 'mongoose';
import { Product, } from '../types/ad.types';
type IProduct = Product & Document;
const ProductSchema: Schema = new Schema(
  {
    id: { type: Number, unique: true, required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    cost: { type: Number },
    special_price: { type: Number },
    image: { type: String },
    url_key: { type: String },
    manufacturer: { type: String },
    website_ids: { type: [Number], default: [] },
    category_ids: { type: [String], default: [] },
    stock_item: {
      item_id: { type: Number },
      product_id: { type: Number },
      stock_id: { type: Number },
      qty: { type: Number },
      is_in_stock: { type: Boolean },
      min_qty: { type: Number },
      min_sale_qty: { type: Number },
      max_sale_qty: { type: Number },
      backorders: { type: Number },
      low_stock_date: { type: String },
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model<IProduct>('Product', ProductSchema);
