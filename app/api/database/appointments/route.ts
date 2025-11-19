import databaseService from "@/src/services/databaseService.js";
import { NextRequest, NextResponse } from "next/server";

// Helper function to mask sensitive data in URLs
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

// Debug function to log environment variables
function debugEnvVariables() {
    console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL (masked):", maskUrl(process.env.DATABASE_URL || ""));
    console.log("POSTGRES_URL exists:", !!process.env.POSTGRES_URL);
    console.log("POSTGRES_URL (masked):", maskUrl(process.env.POSTGRES_URL || ""));
    console.log("TEXTBELT_KEY exists:", !!process.env.TEXTBELT_KEY);
    console.log("GOOGLE_MAPS_KEY exists:", !!process.env.GOOGLE_MAPS_KEY);
    console.log("NEXT_PUBLIC_BUSINESS_PHONE:", process.env.NEXT_PUBLIC_BUSINESS_PHONE);
    console.log("SERVICE_AREA:", process.env.SERVICE_AREA);
    console.log("NEXT_PUBLIC_BUSINESS_ADDRESS:", process.env.NEXT_PUBLIC_BUSINESS_ADDRESS);
    console.log("All env keys:", Object.keys(process.env).filter(key => 
        key.includes("DATABASE") || 
        key.includes("POSTGRES") || 
        key.includes("TEXTBELT") || 
        key.includes("GOOGLE") ||
        key.includes("BUSINESS") ||
        key.includes("SERVICE")
    ));
    console.log("===================================");
}

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
        // Debug: Log environment variables
        debugEnvVariables();
        
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
