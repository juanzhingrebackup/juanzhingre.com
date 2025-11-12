"use client";

import React, { useState, useEffect } from "react";
import "./ConfirmationCode.css";

interface ConfirmationCodeProps {
    onClose: () => void;
    onConfirm: (code: string) => void;
    generatedCode: string;
    appointmentDetails: any;
}

const ConfirmationCode: React.FC<ConfirmationCodeProps> = ({
    onClose,
    onConfirm,
    generatedCode,
    appointmentDetails
}) => {
    const [code, setCode] = useState(["", "", "", ""]);
    const [isValid, setIsValid] = useState(false);

    // Check if all 4 spaces are filled and code matches
    useEffect(() => {
        const fullCode = code.join("");
        const isComplete = fullCode.length === 4;
        const isCorrect = fullCode === generatedCode;
        setIsValid(isComplete && isCorrect);
    }, [code, generatedCode]);

    const handleInputChange = (index: number, value: string) => {
        // Only allow single letter input
        if (value.length > 1) return;

        const newCode = [...code];
        newCode[index] = value.toUpperCase();
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(
                `code-input-${index + 1}`
            );
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace to go to previous input
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const prevInput = document.getElementById(
                `code-input-${index - 1}`
            );
            prevInput?.focus();
        }
    };

    const handleConfirm = () => {
        if (isValid) {
            onConfirm(code.join(""));
        }
    };

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-window">
                <div className="confirmation-header">
                    <h2>Confirm Your Appointment</h2>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="confirmation-content">
                    <p>Please enter the 4-letter confirmation code:</p>

                    <div className="code-inputs">
                        {code.map((letter, index) => (
                            <input
                                key={index}
                                id={`code-input-${index}`}
                                type="text"
                                maxLength={1}
                                value={letter}
                                onChange={(e) =>
                                    handleInputChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`code-input ${letter ? "filled" : ""} ${isValid ? "valid" : ""}`}
                                placeholder="A"
                            />
                        ))}
                    </div>

                    <div className="appointment-summary">
                        <h3>Appointment Details:</h3>
                        <p>
                            <strong>Name:</strong> {appointmentDetails.name}
                        </p>
                        <p>
                            <strong>Service:</strong> {appointmentDetails.cut}
                        </p>
                        <p>
                            <strong>Date:</strong> {appointmentDetails.day}{" "}
                            {appointmentDetails.date}
                        </p>
                        <p>
                            <strong>Time:</strong> {appointmentDetails.time}
                        </p>
                        <p>
                            <strong>Location:</strong>{" "}
                            {appointmentDetails.location}
                        </p>
                    </div>

                    <button
                        className={`confirm-button ${isValid ? "valid" : "disabled"}`}
                        onClick={handleConfirm}
                        disabled={!isValid}
                    >
                        {isValid ? "Confirm Appointment" : "Enter Code"}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmationCode; // By John Michael
