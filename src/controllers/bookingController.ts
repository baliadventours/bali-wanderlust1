import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const bookingSchema = z.object({
  tourId: z.string(),
  userId: z.string(),
  price: z.number().positive(),
});

export const getAllBookings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { tour: true, user: true },
    });
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (err) {
    next(err);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: { tour: true, user: true },
    });

    if (!booking) {
      return res.status(404).json({ status: 'fail', message: 'Booking not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = bookingSchema.parse(req.body);
    
    // Verify tour and user exist
    const tour = await prisma.tour.findUnique({ where: { id: validatedData.tourId } });
    const user = await prisma.user.findUnique({ where: { id: validatedData.userId } });

    if (!tour || !user) {
      return res.status(400).json({ status: 'fail', message: 'Invalid tourId or userId' });
    }

    const newBooking = await prisma.booking.create({
      data: validatedData,
    });

    res.status(201).json({
      status: 'success',
      data: { booking: newBooking },
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, paid } = z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
      paid: z.boolean().optional(),
    }).parse(req.body);

    const updatedBooking = await prisma.booking.update({
      where: { id: id as string },
      data: { status, paid },
    });

    res.status(200).json({
      status: 'success',
      data: { booking: updatedBooking },
    });
  } catch (err) {
    next(err);
  }
};
