import { Request, Response, NextFunction } from 'express';
import {
    getUserProfileService,
    getAllUsersService,
    getAttendanceReportFromDB,
} from './user.service';
import { repo } from './user.repo';

export const getUserProfileController = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: 'Authorization header missing' });
            return;
        }

        const token = authHeader.replace('Bearer ', '');
        const user = await getUserProfileService(token);

        res.status(200).json({
            message: 'User data fetched',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsersController = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: 'Authorization header missing' });
            return;
        }

        const token = authHeader.replace('Bearer ', '');
        const { search, role, status, approval } = req.query;

        const users = await getAllUsersService(
            token,
            (search as string) || '',
            (role as string) || '',
            (status as any) || '',
            (approval as any) || '',
        );

        res.status(200).json({
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

export const approveUserController = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await repo.approveUser(id);

        res.status(200).json({
            message: 'User approved successfully',
            data: { id, isApproved: true },
        });
    } catch (error) {
        next(error);
    }
};

export const rejectUserController = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await repo.rejectUser(id);

        res.status(200).json({
            message: 'User rejected and removed successfully',
            data: { id },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUserController = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await repo.deleteUser(id);

        res.status(200).json({
            message: 'User deleted successfully',
            data: { id },
        });
    } catch (error) {
        next(error);
    }
};

export const getAttendanceReportController = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { location, dateRange } = req.query;
        const report = await getAttendanceReportFromDB(
            (location as string) || '',
            (dateRange as string) || '',
        );

        res.status(200).json({
            message: 'Attendance report fetched successfully',
            data: report,
        });
    } catch (error) {
        next(error);
    }
};
