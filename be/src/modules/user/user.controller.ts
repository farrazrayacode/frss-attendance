import { NextFunction, Request, Response, RequestHandler } from 'express'; 
import { getAllUsersService, getUserProfileService, getAttendanceReportFromDB, getAttendancesTodayCount, getBlacklistDetectionCount } from './user.service'; 
import { repo } from './user.repo'; 
import { adminDb1, adminDb2, adminAuth1 } from '../../config/firebase';

// ==========================================
// FIREBASE HELPER FUNCTIONS (DUAL FIREBASE)
// ==========================================

// Mengambil data dari Firestore Firebase 1
export async function getUserFromFirebase1(userId: string) {
    const doc = await adminDb1.collection('users').doc(userId).get();
    return doc.data();
}

// Mengambil atau menyimpan log ke Firestore Firebase 2
export async function saveLogToFirebase2(logData: any) {
    await adminDb2.collection('activity_logs').add({
        ...logData,
        timestamp: new Date()
    });
}

// Verifikasi token Auth dari Firebase 1
export async function verifyUserToken(token: string) {
    const decodedToken = await adminAuth1.verifyIdToken(token);
    return decodedToken;
}

// ==========================================
// CONTROLLERS
// ==========================================

export const getUserProfileController: RequestHandler = async (
    req,
    res,
    next
): Promise<void> => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const accessToken = authorization.split(' ')[1];
        const response = await getUserProfileService(accessToken);

        res.status(200).json({ message: 'User data fetched', data: response });
    } catch (error) {
        next(error);
    }
};

export const getAllUsersController: RequestHandler = async (req, res, next): Promise<void> => { 
    try {
        const { search, roleFilter, statusFilter, approvalFilter } = req.query;
        const authorization = req.headers.authorization;

        if (!authorization) {
            res.status(404).json({ message: 'Users not found' });
            return;
        }

        const accessToken = authorization.split(' ')[1];
        const response = await getAllUsersService(
            accessToken, 
            search as string, 
            roleFilter as string, 
            statusFilter as 'Online' | 'Offline' | '', 
            approvalFilter as 'Approved' | 'Pending' | ''
        );
        
        res.status(200).json({ message: 'User data fetched', data: response });
    } catch (error) {
        console.error('getAllUsersController error:', error);
        next(error);
    }
};

export const getAttendanceReportController: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { locationFilter, dateRangeFilter } = req.query;
        const data = await getAttendanceReportFromDB(
            locationFilter as string,
            dateRangeFilter as string
        );
        res.json({ data });
    } catch (err) {
        console.error('getAttendanceReportController error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        next(err);
    }
};

export const approveUser: RequestHandler = async (req, res) => { 
    try {
        const userId = req.params.id as string;
        const [affectedRows] = await repo.approveUser(userId);
        if (affectedRows === 0) {
            res.status(404).json({ message: 'User not found or already approved' });
            return; 
        }

        // Simpan log ke Firebase 2
        await saveLogToFirebase2({ action: 'APPROVE_USER', targetUserId: userId });

        res.status(200).json({ message: 'User approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to approve user', error });
    }
};

export const rejectUser: RequestHandler = async (req, res) => { 
    try {
        const userId = req.params.id as string;
        const deletedRows = await repo.rejectUser(userId); 
        if (deletedRows === 0) {
            res.status(404).json({ message: 'User not found' });
            return; 
        }

        // Simpan log ke Firebase 2
        await saveLogToFirebase2({ action: 'REJECT_USER', targetUserId: userId });

        res.status(200).json({ message: 'User rejected and deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to reject (delete) user', error });
    }
};

export const createUser: RequestHandler = async (req, res) => { 
    try {
        const user = await repo.createUser(req.body); 

        // Simpan log ke Firebase 2
        await saveLogToFirebase2({ action: 'CREATE_USER', data: req.body });

        res.status(201).json({ message: 'User created successfully', data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user', error });
    }
};

export const updateUser: RequestHandler = async (req, res) => { 
    try {
        const userId = req.params.id as string;
        const [affectedRows] = await repo.updateUser(userId, req.body); 
        if (affectedRows === 0) {
            res.status(404).json({ message: 'User not found or no changes made' });
            return; 
        }
        const updatedUser = await repo.getUserProfile(userId); 

        // Simpan log ke Firebase 2
        await saveLogToFirebase2({ action: 'UPDATE_USER', targetUserId: userId });

        res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update user', error });
    }
};

export const deleteUser: RequestHandler = async (req, res) => { 
    try {
        const userId = req.params.id as string;
        const deletedRows = await repo.deleteUser(userId); 
        if (deletedRows === 0) {
            res.status(404).json({ message: 'User not found' });
            return; 
        }

        // Simpan log ke Firebase 2
        await saveLogToFirebase2({ action: 'DELETE_USER', targetUserId: userId });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete user', error });
    }
};

export const getAttendancesTodayController: RequestHandler = async (req, res) => {
    try {
        const count = await getAttendancesTodayCount();
        res.json({ data: count });
    } catch (err) {
        console.error('getAttendancesTodayController error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getBlacklistDetectionController: RequestHandler = async (req, res) => {
    try {
        const count = await getBlacklistDetectionCount();
        res.json({ data: count });
    } catch (err) {
        console.error('getBlacklistDetectionController error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};