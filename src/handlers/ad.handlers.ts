import { Request, Response } from 'express';
import AdModel from '../model/ad.modal';
import { NotFoundError } from '../errors/not-found.error';
import fs from 'fs';
import path from 'path';
export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const ad = await AdModel.create({
      ...req.body,
      imageUrl: [],
    });

    const adFolder = path.join(__dirname, '../../uploads', ad._id.toString());
    if (!fs.existsSync(adFolder)) {
      fs.mkdirSync(adFolder, { recursive: true });
    }

    const imageUrls = (req.files as Express.Multer.File[]).map((file) => {
      const newPath = path.join(adFolder, file.filename);
      fs.renameSync(file.path, newPath);
      return `/uploads/${ad._id}/${file.filename}`;
    });

    ad.imageUrl = imageUrls;
    await ad.save();

    res.json(ad);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
export const updateAd = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const ad = await AdModel.findOneAndUpdate(
    {
      _id: id,
    },
    req.body,
    {
      new: true,
    }
  );

  if (!ad) {
    throw new NotFoundError('ad not found!');
  }

  res.json(ad);
};
export const getAds = async (_req: Request, res: Response): Promise<void> => {
  const ads = await AdModel.find({});
  res.json(ads);
};

export const deleteAd = async (req: Request, res: Response) => {
  const { id } = req.params;

  const ad = await AdModel.findOneAndDelete({
    _id: id,
  });

  if (!ad) {
    throw new NotFoundError('ad not found!');
  }

  res.json(ad);
};
