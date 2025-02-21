import { Request, Response } from 'express';
import AdModel from '../model/ad.modal';
import { NotFoundError } from '../errors/not-found.error';
import fs from 'fs';
import path from 'path';
import { InternalError } from '../errors/internal.error';
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
    throw new InternalError();
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
export const getAdsByPage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { screen } = req.query;
    console.log('🚀 ~ page:', screen);

    if (!screen) {
      throw new NotFoundError('page not found!');
    }

    const ads = await AdModel.find({ screen });

    res.json(ads);
  } catch (error) {
    throw new InternalError();
  }
};
export const getAdImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, filename } = req.params;
    const adFolder = path.join(__dirname, '../../uploads', id);
    if (!fs.existsSync(adFolder)) {
      throw new NotFoundError('No images found');
    }
    const files = fs.readdirSync(adFolder);
    if (files.length === 0) {
      throw new NotFoundError('No images found');
    }
    const imagePath = path.join(adFolder, filename);
    res.sendFile(imagePath);
  } catch (error) {
    throw new InternalError();
  }
};
