import databaseService from "@/src/services/databaseService.js";
import { NextRequest, NextResponse } from "next/server";

// Helper method to mask sensitive data in URLs
function maskUrl(url: string): string {
    if (!url) return "undefined";
    try {
        const urlObj = new URL(url);
        if (urlObj.password) {
            urlObj.password = "***";
        }
        if (urlObj.username) {
            urlObj.username = urlObj.username.substring(0, 3) + "***";
        }
        return urlObj.toString();
    } catch {
        // If URL parsing fails, just mask the middle part
        if (url.length > 50) {
            return url.substring(0, 20) + "***" + url.substring(url.length - 20);
        }
        return "***";
    }
}

// Helper method to check database configuration
function checkDatabaseConfig() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL environment variable is not set");
        return NextResponse.json(
            {
                success: false,
                error: "Database configuration missing"
            },
            { status: 500 }
        );
    }
    return null; // No error
}

// GET - Fetch all appointments
export async function GET(req: NextRequest) {
    try {
        // Check if DATABASE_URL is set
        const configError = checkDatabaseConfig();
        if (configError) return configError;

        // Initialize database (creates table if it doesn't exist)
        await databaseService.init();

        // Get all appointments
        const result = await databaseService.getAppointments();

        // Return upon success
        if (result.success) {
            return NextResponse.json(
                {
                    success: true,
                    appointments: result.appointments
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
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch appointments"
            },
            { status: 500 }
        );
    }
}

// POST - Create a new appointment
export async function POST(req: NextRequest) {
    try {
        // Check if DATABASE_URL is set
        const configError = checkDatabaseConfig();
        if (configError) return configError;

        // Initialize database (creates table if it doesn't exist)
        await databaseService.init();

        // Get body from request
        const body = await req.json();
        const {
            name,
            phone,
            cut,
            day,
            date,
            time,
            location,
            address,
            notes,
            confirmationCode,
            status = "confirmed"
        } = body;

        // Validate required fields
        if (
            !name ||
            !phone ||
            !cut ||
            !day ||
            !date ||
            !time ||
            !location ||
            !confirmationCode
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields",
                    required: [
                        "name",
                        "phone",
                        "cut",
                        "day",
                        "date",
                        "time",
                        "location",
                        "confirmationCode"
                    ]
                },
                { status: 400 }
            );
        }

        // Check for race condition - verify slot is still available
        const existingAppointments = await databaseService.getAppointmentsByDateTime(date, time);
        if (existingAppointments.success && existingAppointments.appointments && existingAppointments.appointments.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Time slot no longer available",
                    code: "SLOT_TAKEN"
                },
                { status: 409 }
            );
        }

        // Create appointment
        const result = await databaseService.createAppointment({
            name,
            phone,
            cut,
            day,
            date,
            time,
            location,
            address,
            notes,
            confirmationCode,
            status
        });

        // Return upon success
        if (result.success) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Appointment created successfully",
                    appointment: result.appointment
                },
                { status: 201 }
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
        console.error("Error creating appointment:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create appointment"
            },
            { status: 500 }
        );
    }
} // By John Michael
