import { Product } from './../types/ad.types';
import mongoose, { Document, Schema } from 'mongoose';
import { Ad, adStatus, adType } from '../types/ad.types';
type IAd = Ad & Document;

const AdSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: [String], default: [] },
    adType: { type: String, enum: adType, required: true },
    clickUrl: { type: String },
    status: { type: String, enum: adStatus, default: 'active' },
    startDate: { type: Date },
    endDate: { type: Date },
    screen: { type: String },
    position: { type: Number },
    backgroundImage: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAd>('Ads', AdSchema);
