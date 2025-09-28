import { SpeedInsights } from "@vercel/speed-insights/react";
import Desktop from './components/Desktop/Desktop';

function App() {
    return (
        <div className="App">
            <Desktop />
            <SpeedInsights />
        </div>
    );
} export default App;