import { Router } from 'express';
import {
  createAd,
  deleteAd,
  getAd,
  getAdImage,
  getAds,
  getAdsByPage,
  updateAd,
  getImage,
} from '../handlers/ad.handlers';
import { upload } from '../utils/multerConfig';

const router = Router();

router.post(
  '/',
  [/* validationMiddleware(createAdDto), */ upload.array('images', 5)],
  createAd
);
router.put(
  '/:id',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'backgroundImage', maxCount: 1 },
  ]),
  updateAd
);
router.get('/', getAds);
router.get('/screen', getAdsByPage);
router.delete('/:id', deleteAd);
router.get('/:id/images/:filename', getAdImage);
router.get('/:id', getAd);
/* router.get('/uploads/:filePath(*)', getImageByFullPath); */
router.get('/uploads/:folder/:filename', getImage);
export default router;
