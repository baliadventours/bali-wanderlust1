import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);

export default router;
