import { Router } from 'express';
import {
    getMonitoringFeedsFromDB,
    getStreamsFromDB,
    getLiveAlertsFromDB,
    getRecordingListFromDB,
    getFilteredCamerasFromDB,
    createCameraInDB,
    updateCameraInDB,
    deleteCameraFromDB,
} from './monitoring.service';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const data = await getMonitoringFeedsFromDB();
        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/cameras', async (req, res) => {
    try {
        const { search, locationFilter, statusFilter } = req.query;
        const data = await getFilteredCamerasFromDB(
            (search as string) || '',
            (locationFilter as string) || '',
            (statusFilter as string) || '',
        );
        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/cameras', async (req, res) => {
    try {
        const { name, streamUrl, location, ipAddress } = req.body;
        if (!name || !streamUrl) {
            return res
                .status(400)
                .json({ error: 'name and streamUrl are required' });
        }
        const data = await createCameraInDB({
            name,
            streamUrl,
            location,
            ipAddress,
        });
        res.status(201).json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/cameras/:id', async (req, res) => {
    try {
        const data = await updateCameraInDB(Number(req.params.id), req.body);
        if (!data) return res.status(404).json({ error: 'Camera not found' });
        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/cameras/:id', async (req, res) => {
    try {
        const deleted = await deleteCameraFromDB(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ error: 'Camera not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/feeds', async (req, res) => {
    try {
        const data = await getMonitoringFeedsFromDB();
        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/streams', async (req, res) => {
    try {
        const streams = await getStreamsFromDB();
        res.json({ data: streams });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/alerts/live', async (req, res) => {
    try {
        const alerts = await getLiveAlertsFromDB();
        res.json({ data: alerts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/recordings', async (req, res) => {
    try {
        const { personName, cameraName, date } = req.query;
        const data = await getRecordingListFromDB(
            personName as string,
            cameraName as string,
            date ? new Date(date as string) : null,
        );
        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
