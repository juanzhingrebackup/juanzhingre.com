"use client";

import React from "react";
import "./LoadingBar.css";

interface LoadingBarProps {
    progress?: number;
}

const LoadingBar: React.FC<LoadingBarProps> = () => {
    return (
        <div className="loading-bar-container">
            <div className="loading-text">Loading...</div>
            <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>
        </div>
    );
};
export default LoadingBar; // By John Michael
