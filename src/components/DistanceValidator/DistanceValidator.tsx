"use client";

import googleMapsService from "@/src/services/googleMapsService";
import React, { useState, useEffect, useRef } from "react";
import "./DistanceValidator.css";

interface DistanceValidatorProps {
    address: string;
    businessLocation: string; // Your business address
    onValidationResult: (isValid: boolean, distance?: number) => void;
    isAddressSelected?: boolean; // Whether user selected from autocomplete
}

const DistanceValidator: React.FC<DistanceValidatorProps> = ({
    address,
    businessLocation,
    onValidationResult,
    isAddressSelected = false
}) => {
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        distance?: number;
        error?: string;
    } | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const previousValidState = useRef<boolean | null>(null);
    // Use ref to store callback to avoid infinite loops
    const onValidationResultRef = useRef(onValidationResult);
    
    // Update ref when callback changes
    useEffect(() => {
        onValidationResultRef.current = onValidationResult;
    }, [onValidationResult]);

    useEffect(() => {
        if (!address || address.length < 5) {
            setValidationResult(null);
            onValidationResultRef.current(true); // Don't block if no address yet
            return;
        }

        // Only validate if user has selected an address from autocomplete
        if (!isAddressSelected) {
            setValidationResult(null);
            onValidationResultRef.current(true); // Don't block if user is still typing
            return;
        }

        const validateDistance = async () => {
            setIsValidating(true);
            try {
                await googleMapsService.initialize();
                const result = await googleMapsService.calculateDistance(
                    businessLocation,
                    address
                );

                const isValid = result.distance <= 10; // 10 miles limit
                const validation = {
                    isValid,
                    distance: result.distance
                };

                setValidationResult(validation);
                onValidationResultRef.current(isValid, result.distance);
            } catch (error) {
                console.error("Distance validation error:", error);
                const validation = {
                    isValid: false,
                    error: "Unable to validate distance"
                };
                setValidationResult(validation);
                onValidationResultRef.current(false);
            } finally {
                setIsValidating(false);
            }
        };

        // Validate immediately when address is selected
        validateDistance();
    }, [address, businessLocation, isAddressSelected]);

    // Play audio when address is determined to be too far
    useEffect(() => {
        if (validationResult && !validationResult.isValid) {
            // Only play if we're transitioning from valid/unknown to invalid
            if (previousValidState.current !== false) {
                const audio = audioRef.current;
                if (audio) {
                    audio.play().catch((error) => {
                        console.error("Error playing audio:", error);
                    });
                }
            }
            previousValidState.current = false;
        } else if (validationResult && validationResult.isValid) {
            previousValidState.current = true;
        }
    }, [validationResult]);

    if (!address || address.length < 5) {
        return null;
    }

    return (
        <>
            <audio ref={audioRef} src="/audio/too-far-error.mp3" preload="auto" />
            {/* Don't show anything if we're still validating or if there's no result yet */}
            {!isValidating && validationResult && !validationResult.isValid && (
                <div className="distance-validator">
                    <div className="validation-status invalid">
                        <span className="status-icon">✗</span>
                        <span className="status-text">
                            {validationResult.error
                                ? validationResult.error
                                : `Outside service area (${validationResult.distance?.toFixed(1)} miles) - Must be 10 miles within Provo, UT`}
                        </span>
                    </div>
                </div>
            )}
            {/* Don't show anything if address is valid (within service area) */}
            {/* The green checkmark will be shown by the AddressAutocomplete component */}
        </>
    );
};
export default DistanceValidator; // By John Michael
