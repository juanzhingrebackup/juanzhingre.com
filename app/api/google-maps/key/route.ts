import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const apiKey = process.env.GOOGLE_MAPS_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Google Maps API key not configured" },
            { status: 500 }
        );
    }

    return NextResponse.json({ apiKey }, { status: 200 });
} // By John Michael
