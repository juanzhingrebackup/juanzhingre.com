import databaseService from "@/src/services/databaseService.js";
import { NextRequest, NextResponse } from "next/server";

// Helper function to check database configuration
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
