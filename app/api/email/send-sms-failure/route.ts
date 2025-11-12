import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/src/services/emailService.js';

export async function POST(req: NextRequest) {
    try {
        // Get the request body
        const body = await req.json();

        // Validate required fields
        const { appointmentDetails, smsError } = body;
        if (!appointmentDetails || !smsError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing appointment details or SMS error'
                },
                { status: 400 }
            );
        }

        // Send the SMS failure notification email
        const result = await emailService.sendSmsFailureNotificationDev(appointmentDetails, smsError);

        // Return upon success
        if (result.success) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'SMS failure notification email sent successfully',
                    messageId: result.messageId
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Email SMS Failure Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send SMS failure notification email'
            },
            { status: 500 }
        );
    }
} // By John Michael
