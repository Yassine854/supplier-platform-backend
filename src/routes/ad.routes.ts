import { Router } from 'express';
import { createAd, deleteAd, getAds, updateAd } from '../handlers/ad.handlers';
import { upload } from '../utils/multerConfig';

const router = Router();

router.post('/', upload.array('images', 5), createAd);
router.put('/:id', updateAd);
router.get('/', getAds);
router.delete('/:id', deleteAd);

export default router;
