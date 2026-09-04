import { Router } from 'express';
import {
    getUserProfileController,
    getAllUsersController,
    approveUserController,
    rejectUserController,
    deleteUserController,
    getAttendanceReportController,
} from './user.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const userRouter = Router();

// Endpoint laporan presensi
userRouter.get(
    '/attendance-report',
    authMiddleware,
    getAttendanceReportController,
);

// Endpoint profile & list user
userRouter.get('/profile', authMiddleware, getUserProfileController);
userRouter.get('/', authMiddleware, getAllUsersController);

// Action buttons (Approve, Reject, Delete)
userRouter.patch('/:id/approve', authMiddleware, approveUserController);
userRouter.delete('/:id/reject', authMiddleware, rejectUserController);
userRouter.delete('/:id', authMiddleware, deleteUserController);

export default userRouter;
