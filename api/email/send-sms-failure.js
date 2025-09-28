import emailService from '../../src/services/emailService.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { appointmentDetails, smsError } = req.body;

        if (!appointmentDetails || !smsError) {
            return res.status(400).json({
                success: false,
                error: 'Missing appointment details or SMS error'
            });
        }

        const result = await emailService.sendSmsFailureNotificationDev(appointmentDetails, smsError);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'SMS failure notification email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Email SMS Failure Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send SMS failure notification email'
        });
    }
} // By John Michael