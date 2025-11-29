import { SpeedInsights } from "@vercel/speed-insights/react";
import Desktop from "@/src/components/Desktop/Desktop";
import ErrorBoundary from "@/src/components/ErrorBoundary/ErrorBoundary";

export default function Home() {
    return (
        <ErrorBoundary>
            <div className="App">
                <Desktop />
                <SpeedInsights />
            </div>
        </ErrorBoundary>
    );
} // By John Michael
