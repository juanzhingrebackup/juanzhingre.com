import databaseService from "@/src/services/databaseService.js";
import { NextRequest, NextResponse } from "next/server";

// GET - Check if confirmation code exists (for uniqueness validation)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Confirmation code is required"
                },
                { status: 400 }
            );
        }

        // Check if code exists in recent appointments (last 24 hours)
        const result = await databaseService.getAppointmentByConfirmationCode(code);

        if (result.success) {
            return NextResponse.json(
                {
                    success: true,
                    exists: !!result.appointment
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
        console.error("Error checking confirmation code:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to check confirmation code"
            },
            { status: 500 }
        );
    }
} // By John Michael

