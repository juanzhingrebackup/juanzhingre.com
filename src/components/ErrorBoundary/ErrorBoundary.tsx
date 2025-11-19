"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import "./ErrorBoundary.css";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details
        console.error("=== ERROR BOUNDARY CAUGHT ERROR ===");
        console.error("Error:", error);
        console.error("Error Info:", errorInfo);
        console.error("Error Stack:", error.stack);
        console.error("Component Stack:", errorInfo.componentStack);

        // Store error info in state
        this.setState({
            error,
            errorInfo
        });

        // You could also log to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <h2 className="error-boundary-title">
                            ⚠️ Something went wrong
                        </h2>
                        <div className="error-boundary-message">
                            <p>The application encountered an error.</p>
                            {this.state.error && (
                                <details className="error-details">
                                    <summary>Error Details (Click to expand)</summary>
                                    <div className="error-details-content">
                                        <div className="error-section">
                                            <strong>Error Message:</strong>
                                            <pre>{this.state.error.toString()}</pre>
                                        </div>
                                        {this.state.error.stack && (
                                            <div className="error-section">
                                                <strong>Stack Trace:</strong>
                                                <pre>{this.state.error.stack}</pre>
                                            </div>
                                        )}
                                        {this.state.errorInfo && (
                                            <div className="error-section">
                                                <strong>Component Stack:</strong>
                                                <pre>{this.state.errorInfo.componentStack}</pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>
                        <div className="error-boundary-actions">
                            <button
                                className="error-boundary-button"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </button>
                            <button
                                className="error-boundary-button"
                                onClick={() => window.location.reload()}
                            >
                                Reload Page
                            </button>
                        </div>
                        <div className="error-boundary-instructions">
                            <p>
                                <strong>For debugging:</strong> Open your browser's developer
                                console to see detailed error logs. On mobile, you can access
                                this by connecting your device to a computer and using remote
                                debugging tools.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

