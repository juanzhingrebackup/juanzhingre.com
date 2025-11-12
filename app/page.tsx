import { SpeedInsights } from "@vercel/speed-insights/react";
import Desktop from "@/src/components/Desktop/Desktop";

export default function Home() {
    return (
        <div className="App">
            <Desktop />
            <SpeedInsights />
        </div>
    );
} // By John Michael
