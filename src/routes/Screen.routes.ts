import { Router } from 'express';
import {
  updateScreen,
  getScreen,
  deleteScreen,
  getAllScreens,
  getScreens,
  createScreen,
  activateScreen,
  deactivateScreen,
  getScreenByTitle,
} from '../handlers/screen.handlers';
const router = Router();
router.put('/:id', updateScreen);
router.get('/all', getAllScreens);
router.delete('/:id', deleteScreen);
router.get('/:id', getScreen);
router.post('/', createScreen);
router.get('/', getScreens);
router.put('/:screenId/activate', activateScreen);
router.put('/:screenId/deactivate', deactivateScreen);
router.get('/screens/:title',getScreenByTitle);
export default router;
