import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Get the request body
        const body = await req.json();
        const { appointmentDetails } = body || {};

        // Validate required fields
        if (!appointmentDetails) {
            return NextResponse.json(
                { success: false, error: "Missing appointment details" },
                { status: 400 }
            );
        }

        // Import the SMS service
        const mod = await import("@/src/services/smsService.js");
        const svc = mod.default || mod.smsService;
        if (!svc || typeof svc.sendBusinessNotification !== "function") {
            throw new Error("sendBusinessNotification missing on SMS service");
        }

        // Send the business notification SMS
        const result = await svc.sendBusinessNotification(appointmentDetails);

        // Return upon success
        if (result?.success) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Business SMS sent",
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
        console.error("SMS Business Notification Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to send business notification SMS"
            },
            { status: 500 }
        );
    }
} // By John Michael
