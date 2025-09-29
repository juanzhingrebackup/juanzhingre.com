import smsService from '../../../src/services/smsService.js';

export default async function handler(req, res) {
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

        const result = await smsService.sendAppointmentConfirmation(appointmentDetails);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Confirmation SMS sent successfully',
                textId: result.textId
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('SMS Confirmation Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send confirmation SMS'
        });
    }
} // By John Michael