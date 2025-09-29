import databaseService from '../../../src/services/databaseService.js';

export default async function handler(req, res) {
    try {
        // Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL environment variable is not set');
            return res.status(500).json({
                success: false,
                error: 'Database configuration missing'
            });
        }

        switch (req.method) {
            case 'GET':
                return await handleGetAppointments(req, res);
            case 'POST':
                return await handleCreateAppointment(req, res);
            case 'DELETE':
                return await handleDeleteOldAppointments(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Database API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

async function handleGetAppointments(req, res) {
    try {
        const result = await databaseService.getAppointments();
        
        if (result.success) {
            res.status(200).json({
                success: true,
                appointments: result.appointments
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch appointments'
        });
    }
}

async function handleCreateAppointment(req, res) {
    try {
        const {
            name,
            phone,
            cut,
            day,
            date,
            time,
            location,
            address,
            confirmationCode,
            status = 'confirmed'
        } = req.body;

        // Validate required fields
        if (!name || !phone || !cut || !day || !date || !time || !location || !confirmationCode) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields',
                required: ['name', 'phone', 'cut', 'day', 'date', 'time', 'location', 'confirmationCode']
            });
        }

        const result = await databaseService.createAppointment({
            name,
            phone,
            cut,
            day,
            date,
            time,
            location,
            address,
            confirmationCode,
            status
        });

        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'Appointment created successfully',
                appointment: result.appointment
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create appointment'
        });
    }
}

async function handleDeleteOldAppointments(req, res) {
    try {
        const result = await databaseService.deleteOldAppointments();
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: `Deleted ${result.deletedCount} old appointments`,
                deletedCount: result.deletedCount
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error deleting old appointments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete old appointments'
        });
    }
} // By John Michael