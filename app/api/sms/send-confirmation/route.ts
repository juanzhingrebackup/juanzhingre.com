import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Get the request body
        const body = await req.json();
        const { appointmentDetails } = body || {};

        // Validate required fields
        if (!appointmentDetails || !appointmentDetails.phone) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing appointment details or phone number"
                },
                { status: 400 }
            );
        }

        // Import the SMS service
        const mod = await import("@/src/services/smsService.js");
        const svc = mod.default || mod.smsService;
        if (!svc || typeof svc.sendAppointmentConfirmation !== "function") {
            throw new Error(
                "sendAppointmentConfirmation missing on SMS service"
            );
        }

        // Send the confirmation SMS
        const result =
            await svc.sendAppointmentConfirmation(appointmentDetails);

        // Return upon success
        if (result?.success) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Confirmation SMS sent",
                    textId: result.textId
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, error: result?.error || "Unknown SMS error" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("SMS Confirmation Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to send confirmation SMS" },
            { status: 500 }
        );
    }
} // By John Michael
