import smsService from '../../src/services/smsService.js';

export default async function handler(req, res) {
    console.log('SMS Confirmation API called');
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { appointmentDetails } = req.body;

        if (!appointmentDetails || !appointmentDetails.phone) {
            return res.status(400).json({
                success: false,
                error: 'Missing appointment details or phone number'
            });
        }

        // Check if SMS service is properly configured
        if (!process.env.TEXTBELT_KEY) {
            console.error('SMS Configuration Error: TEXTBELT_KEY environment variable not set');
            return res.status(500).json({
                success: false,
                error: 'SMS service not configured'
            });
        }

        console.log('Attempting to send SMS confirmation for:', appointmentDetails.phone);
        const result = await smsService.sendAppointmentConfirmation(appointmentDetails);
        console.log('SMS service result:', result);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Confirmation SMS sent successfully',
                textId: result.textId
            });
        } else {
            console.error('SMS service failed:', result.error);
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('SMS Confirmation Error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            success: false,
            error: 'Failed to send confirmation SMS'
        });
    }
} // By John Michael
