import { Router } from 'express';
import * as tourController from '../controllers/tourController.js';

const router = Router();

router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTour);
router.post('/', tourController.createTour);
router.patch('/:id', tourController.updateTour);
router.delete('/:id', tourController.deleteTour);

export default router;
