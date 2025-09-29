export default async function handler(req, res) {
    console.log('=== SMS CONFIRMATION API CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'No body');
    
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('=== ATTEMPTING TO IMPORT SMS SERVICE ===');
        // Import the service inside the function to avoid module loading issues
        const smsService = (await import('../../src/services/smsService.js')).default;
        console.log('SMS Service imported successfully:', !!smsService);
        
        console.log('=== PARSING REQUEST BODY ===');
        const { appointmentDetails } = req.body;
        console.log('Appointment details:', JSON.stringify(appointmentDetails, null, 2));

        if (!appointmentDetails || !appointmentDetails.phone) {
            console.log('Missing appointment details or phone number');
            return res.status(400).json({
                success: false,
                error: 'Missing appointment details or phone number'
            });
        }

        console.log('=== CHECKING ENVIRONMENT VARIABLES ===');
        console.log('TEXTBELT_KEY present:', !!process.env.TEXTBELT_KEY);
        console.log('TEXTBELT_KEY length:', process.env.TEXTBELT_KEY ? process.env.TEXTBELT_KEY.length : 0);
        
        // Check if SMS service is properly configured
        if (!process.env.TEXTBELT_KEY) {
            console.error('SMS Configuration Error: TEXTBELT_KEY environment variable not set');
            return res.status(500).json({
                success: false,
                error: 'SMS service not configured'
            });
        }

        console.log('=== CALLING SMS SERVICE ===');
        console.log('Attempting to send SMS confirmation for:', appointmentDetails.phone);
        const result = await smsService.sendAppointmentConfirmation(appointmentDetails);
        console.log('SMS service result:', JSON.stringify(result, null, 2));

        console.log('=== PROCESSING SMS RESULT ===');
        if (result.success) {
            console.log('SMS sent successfully, textId:', result.textId);
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
        console.error('=== SMS CONFIRMATION ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({
            success: false,
            error: 'Failed to send confirmation SMS'
        });
    }
} // By John Michael