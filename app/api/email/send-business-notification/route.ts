import emailService from '@/src/services/emailService.js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Get the request body
        const body = await req.json();

        // Validate required fields
        const { appointmentDetails } = body;
        if (!appointmentDetails) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing appointment details'
                },
                { status: 400 }
            );
        }

        // Send the business notification email
        const result = await emailService.sendAppointmentReminder(appointmentDetails);

        // Return upon success
        if (result.success) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Business notification email sent successfully',
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
        console.error('Email Business Notification Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send business notification email'
            },
            { status: 500 }
        );
    }
} // By John Michael
