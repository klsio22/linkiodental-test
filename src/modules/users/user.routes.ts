import { Router } from 'express';
import userController from './controllers/user.controller';
import { validate } from '../../common/middlewares/validator';
import { registerValidation, loginValidation, updateUserValidation } from './validators/user.validator';
import { authMiddleware } from '../../common/middlewares/auth';

const router = Router();

router.post('/register', validate(registerValidation), userController.register);
router.post('/login', validate(loginValidation), userController.login);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, validate(updateUserValidation), userController.updateUser);

export default router;
