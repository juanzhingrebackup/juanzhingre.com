"use client";

import { useEffect, useState } from "react";
import "./ErrorLogger.css";

interface ErrorLog {
    id: string;
    timestamp: Date;
    type: "error" | "unhandledrejection" | "warning";
    message: string;
    stack?: string;
    source?: string;
}

const ErrorLogger: React.FC = () => {
    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [errorCount, setErrorCount] = useState(0);

    useEffect(() => {
        // Handle unhandled errors
        const handleError = (event: ErrorEvent) => {
            const errorLog: ErrorLog = {
                id: Date.now().toString(),
                timestamp: new Date(),
                type: "error",
                message: event.message || "Unknown error",
                stack: event.error?.stack,
                source: event.filename
                    ? `${event.filename}:${event.lineno}:${event.colno}`
                    : undefined
            };

            console.error("=== UNHANDLED ERROR ===");
            console.error("Message:", errorLog.message);
            console.error("Source:", errorLog.source);
            console.error("Stack:", errorLog.stack);
            console.error("Event:", event);

            setErrors((prev) => [errorLog, ...prev].slice(0, 50)); // Keep last 50 errors
            setErrorCount((prev) => prev + 1);
        };

        // Handle unhandled promise rejections
        const handleRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason;
            const errorLog: ErrorLog = {
                id: Date.now().toString(),
                timestamp: new Date(),
                type: "unhandledrejection",
                message:
                    error?.message ||
                    (typeof error === "string" ? error : "Unhandled promise rejection"),
                stack: error?.stack
            };

            console.error("=== UNHANDLED PROMISE REJECTION ===");
            console.error("Reason:", error);
            console.error("Stack:", errorLog.stack);
            console.error("Event:", event);

            setErrors((prev) => [errorLog, ...prev].slice(0, 50));
            setErrorCount((prev) => prev + 1);
        };

        // Handle console errors (catch console.error calls)
        const originalConsoleError = console.error;
        console.error = (...args: unknown[]) => {
            originalConsoleError.apply(console, args);
            // Only log if it's an actual error object, not just console.error calls
            const errorArg = args.find(
                (arg) => arg instanceof Error || (typeof arg === "object" && arg !== null)
            );
            if (errorArg instanceof Error) {
                const errorLog: ErrorLog = {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    type: "error",
                    message: errorArg.message || "Console error",
                    stack: errorArg.stack
                };
                setErrors((prev) => [errorLog, ...prev].slice(0, 50));
                setErrorCount((prev) => prev + 1);
            }
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleRejection);

        return () => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleRejection);
            console.error = originalConsoleError;
        };
    }, []);

    if (errorCount === 0) {
        return null;
    }

    return (
        <>
            {/* Floating error indicator button */}
            <button
                className="error-logger-toggle"
                onClick={() => setIsVisible(!isVisible)}
                title={`${errorCount} error(s) detected - Click to view`}
            >
                ⚠️ {errorCount}
            </button>

            {/* Error log panel */}
            {isVisible && (
                <div className="error-logger-panel">
                    <div className="error-logger-header">
                        <h3>Error Log ({errorCount})</h3>
                        <button
                            className="error-logger-close"
                            onClick={() => setIsVisible(false)}
                        >
                            ×
                        </button>
                    </div>
                    <div className="error-logger-content">
                        {errors.length === 0 ? (
                            <p>No errors logged</p>
                        ) : (
                            errors.map((error) => (
                                <div key={error.id} className="error-log-entry">
                                    <div className="error-log-header">
                                        <span className="error-log-type">{error.type}</span>
                                        <span className="error-log-time">
                                            {error.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="error-log-message">{error.message}</div>
                                    {error.source && (
                                        <div className="error-log-source">{error.source}</div>
                                    )}
                                    {error.stack && (
                                        <details className="error-log-stack">
                                            <summary>Stack Trace</summary>
                                            <pre>{error.stack}</pre>
                                        </details>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="error-logger-footer">
                        <button
                            className="error-logger-clear"
                            onClick={() => {
                                setErrors([]);
                                setErrorCount(0);
                            }}
                        >
                            Clear Log
                        </button>
                        <button
                            className="error-logger-copy"
                            onClick={() => {
                                const logText = errors
                                    .map(
                                        (e) =>
                                            `[${e.timestamp.toISOString()}] ${e.type.toUpperCase()}: ${e.message}${e.stack ? `\n${e.stack}` : ""}`
                                    )
                                    .join("\n\n");
                                navigator.clipboard.writeText(logText);
                                alert("Error log copied to clipboard!");
                            }}
                        >
                            Copy All
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ErrorLogger;

