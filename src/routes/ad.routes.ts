import { Router } from 'express';
import {
  createAd,
  deleteAd,
  getAdImage,
  getAds,
  getAdsByPage,
  updateAd,
} from '../handlers/ad.handlers';
import { upload } from '../utils/multerConfig';
import validationMiddleware from '../middlewares/validation.middlewares';
import { createAdDto } from '../types/ad.types';

const router = Router();

router.post(
  '/',
  [/* validationMiddleware(createAdDto), */ upload.array('images', 5)],
  createAd
);
router.put('/:id', updateAd);
router.get('/', getAds);
router.get('/screen', getAdsByPage);
router.delete('/:id', deleteAd);
router.get('/:id/images/:filename', getAdImage);

export default router;
