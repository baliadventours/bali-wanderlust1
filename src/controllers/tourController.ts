import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const tourSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  location: z.string(),
  maxGroupSize: z.number().int().positive(),
  difficulty: z.enum(['Easy', 'Medium', 'Difficult']),
  images: z.string().optional(),
  startDates: z.string().optional(),
});

export const getAllTours = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tours = await prisma.tour.findMany();
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    next(err);
  }
};

export const getTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tour = await prisma.tour.findUnique({
      where: { id: id as string },
      include: { bookings: true },
    });

    if (!tour) {
      return res.status(404).json({ status: 'fail', message: 'Tour not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    next(err);
  }
};

export const createTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = tourSchema.parse(req.body);
    const newTour = await prisma.tour.create({
      data: {
        ...validatedData,
        images: validatedData.images || '',
        startDates: validatedData.startDates || '',
      },
    });

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    next(err);
  }
};

export const updateTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = tourSchema.partial().parse(req.body);
    const updatedTour = await prisma.tour.update({
      where: { id: id as string },
      data: validatedData,
    });

    res.status(200).json({
      status: 'success',
      data: { tour: updatedTour },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.tour.delete({
      where: { id: id as string },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
