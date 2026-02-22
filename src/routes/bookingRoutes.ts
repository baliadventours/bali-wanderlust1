import { Router } from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router = Router();

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.getBooking);
router.patch('/:id', bookingController.updateBookingStatus);

export default router;
