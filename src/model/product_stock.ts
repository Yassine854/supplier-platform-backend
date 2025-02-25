import mongoose, { Document, Schema } from 'mongoose';

interface IProductStock extends Document {
  sku: string;
  stocks: {
    warehouseCode: string;
    quantity: number;
  }[];
}

const ProductStockSchema: Schema = new Schema({
  sku: { 
    type: String, 
    required: true, 
    unique: true 
  },
  stocks: [{
    warehouseCode: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      default: 0 
    }
  }]
}, { 
  timestamps: true 
});

// Indexes for fast lookups
ProductStockSchema.index({ sku: 1 });
ProductStockSchema.index({ 
  sku: 1,
  'stocks.warehouseCode': 1 
});

export default mongoose.model<IProductStock>(
  'ProductStock',
  ProductStockSchema,
  'products_stock'
);