import { z } from 'zod';
import { objectIdSchema } from './zod.types';
export enum adType {
  BANNER = 'banner',
  VIDEO = 'video',
}
export enum adStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const adSchema = z.object({
  _id: objectIdSchema.optional(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.array(z.string()),
  clickUrl: z.string(),
  adType: z.nativeEnum(adType),
  status: z.nativeEnum(adStatus),
  startDate: z.date(),
  endDate: z.date(),
});
export type Ad = z.infer<typeof adSchema>;
export const ProductSchema=z.object({
  _id: objectIdSchema.optional(),

});
export type Product=z.infer<typeof ProductSchema>

export const createAdDto = adSchema
  .pick({
    title: true,
    description: true,
    imageUrl: true,
    clickUrl: true,
    adType: true,
    startDate: true,
    endDate: true,
  })
  .strict();

export type CreateBranchDto = z.infer<typeof createAdDto>;
