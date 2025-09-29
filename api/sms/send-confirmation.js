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
        console.log('Import path: ../../src/services/smsService.js');
        console.log('Current working directory:', process.cwd());
        console.log('Node version:', process.version);
        console.log('Platform:', process.platform);
        
        // Import the service inside the function to avoid module loading issues
        const smsServiceModule = await import('../../src/services/smsService.js');
        console.log('SMS Service module:', smsServiceModule);
        console.log('SMS Service module keys:', Object.keys(smsServiceModule));
        console.log('SMS Service module default:', smsServiceModule.default);
        
        const smsService = smsServiceModule.default;
        console.log('SMS Service imported successfully:', !!smsService);
        console.log('SMS Service type:', typeof smsService);
        console.log('SMS Service constructor name:', smsService?.constructor?.name);
        console.log('SMS Service methods:', smsService ? Object.getOwnPropertyNames(smsService) : 'No service');
        console.log('SMS Service prototype methods:', smsService ? Object.getOwnPropertyNames(Object.getPrototypeOf(smsService)) : 'No prototype');
        console.log('SMS Service sendAppointmentConfirmation method:', typeof smsService?.sendAppointmentConfirmation);
        
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
        console.log('TEXTBELT_KEY first 5 chars:', process.env.TEXTBELT_KEY ? process.env.TEXTBELT_KEY.substring(0, 5) : 'N/A');
        console.log('TEXTBELT_KEY last 5 chars:', process.env.TEXTBELT_KEY ? process.env.TEXTBELT_KEY.substring(process.env.TEXTBELT_KEY.length - 5) : 'N/A');
        console.log('All environment variables with TEXT:', Object.keys(process.env).filter(key => key.includes('TEXT')));
        console.log('All environment variables with BELT:', Object.keys(process.env).filter(key => key.includes('BELT')));
        
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
        console.log('SMS Service object before call:', JSON.stringify(smsService, null, 2));
        console.log('About to call sendAppointmentConfirmation with:', JSON.stringify(appointmentDetails, null, 2));
        
        // Try to call the method, but handle the case where it might not exist
        let result;
        if (typeof smsService.sendAppointmentConfirmation === 'function') {
            result = await smsService.sendAppointmentConfirmation(appointmentDetails);
        } else {
            console.error('sendAppointmentConfirmation is not a function, trying alternative approach');
            // Fallback: try to call it directly on the prototype
            if (smsService.constructor && smsService.constructor.prototype.sendAppointmentConfirmation) {
                result = await smsService.constructor.prototype.sendAppointmentConfirmation.call(smsService, appointmentDetails);
            } else {
                throw new Error('sendAppointmentConfirmation method not found on SMS service');
            }
        }
        console.log('SMS service result:', JSON.stringify(result, null, 2));
        console.log('Result success:', result?.success);
        console.log('Result error:', result?.error);
        console.log('Result textId:', result?.textId);

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