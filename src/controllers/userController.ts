import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: id as string },
      include: { bookings: { include: { tour: true } } },
    });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = userSchema.parse(req.body);
    const newUser = await prisma.user.create({
      data: validatedData,
    });

    res.status(201).json({
      status: 'success',
      data: { user: newUser },
    });
  } catch (err) {
    if ((err as any).code === 'P2002') {
      return res.status(400).json({ status: 'fail', message: 'Email already exists' });
    }
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = userSchema.partial().parse(req.body);
    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: validatedData,
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};
