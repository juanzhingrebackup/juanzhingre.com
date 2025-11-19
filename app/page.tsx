import { SpeedInsights } from "@vercel/speed-insights/react";
import Desktop from "@/src/components/Desktop/Desktop";
import ErrorBoundary from "@/src/components/ErrorBoundary/ErrorBoundary";
import ErrorLogger from "@/src/components/ErrorLogger/ErrorLogger";

export default function Home() {
    return (
        <ErrorBoundary>
            <div className="App">
                <Desktop />
                <SpeedInsights />
                <ErrorLogger />
            </div>
        </ErrorBoundary>
    );
} // By John Michael
