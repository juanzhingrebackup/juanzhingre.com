"use client";

import googleMapsService from '@/src/services/googleMapsService';
import React, { useState, useEffect, useRef } from 'react';
import './AddressAutocomplete.css';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onPlaceSelect: (place: any) => void;
    onAddressSelected?: (isSelected: boolean) => void;
    isValid?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

interface Prediction {
    place_id: string;
    description: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({value, onChange, onPlaceSelect, onAddressSelected, isValid = false, disabled = false, placeholder = "Enter your address", className = ""}) => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (value.length < 3) {
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        // Don't fetch new predictions if this address was selected from autocomplete
        if (isValid) {
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        // Debounce the API call
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                await googleMapsService.initialize();
                googleMapsService.getPlacePredictions(value, (predictions: any, status: any) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setPredictions(predictions.slice(0, 5)); // Limit to 5 predictions
                        setShowPredictions(true);
                    } else {
                        setPredictions([]);
                        setShowPredictions(false);
                    }
                    setIsLoading(false);
                });
            } catch (error) {
                console.error('Error getting predictions:', error);
                setPredictions([]);
                setShowPredictions(false);
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, isValid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        // Notify that user is typing (not selected from autocomplete)
        if (onAddressSelected) {
            onAddressSelected(false);
        }
    };

    const handlePredictionClick = async (prediction: Prediction) => {
        onChange(prediction.description);
        setShowPredictions(false);
        setPredictions([]); // Clear predictions immediately

        // Notify that user selected from autocomplete
        if (onAddressSelected) {
            onAddressSelected(true);
        }

        try {
        await googleMapsService.initialize();
        googleMapsService.getPlaceDetails(prediction.place_id, (place: any, status: any) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                onPlaceSelect(place);
            }
        });
        } catch (error) {
            console.error('Error getting place details:', error);
        }
    };

    const handleInputFocus = () => {
        if (predictions.length > 0) {
            setShowPredictions(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding predictions to allow for clicks
        setTimeout(() => {
            setShowPredictions(false);
        }, 200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowPredictions(false);
        }
    };

    return (
        <div className={`address-autocomplete ${className}`}>
            <div className="input-container">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`input ${className}`}
                />
                {isLoading && <div className="loading-spinner">⟳</div>}
                {isValid && !isLoading && (
                    <span className="address-checkmark">✓</span>
                )}
            </div>
            
            {showPredictions && predictions.length > 0 && (
            <div className="predictions-dropdown">
                {predictions.map((prediction) => (
                <div
                    key={prediction.place_id}
                    className="prediction-item"
                    onClick={() => handlePredictionClick(prediction)}
                >
                    {prediction.description}
                </div>
                ))}
            </div>
            )}
        </div>
    );
}; export default AddressAutocomplete; // By John Michael