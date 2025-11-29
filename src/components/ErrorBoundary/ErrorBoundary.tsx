"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        
        // Log to error reporting service if needed
        // You can add Sentry, LogRocket, etc. here
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100vh",
                        width: "100vw",
                        backgroundColor: "#c0c0c0",
                        fontFamily: "Perfect DOS VGA 437, Courier New, Courier, monospace",
                        padding: "20px",
                        textAlign: "center"
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            border: "2px solid #000000",
                            padding: "20px",
                            maxWidth: "500px"
                        }}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: "10px" }}>
                            Something went wrong
                        </h2>
                        <p style={{ marginBottom: "20px", fontSize: "14px" }}>
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>
                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#c0c0c0",
                                border: "2px outset #c0c0c0",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: "14px"
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.border = "2px inset #c0c0c0";
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.border = "2px outset #c0c0c0";
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#c0c0c0",
                                border: "2px outset #c0c0c0",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: "14px",
                                marginLeft: "10px"
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.border = "2px inset #c0c0c0";
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.border = "2px outset #c0c0c0";
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

