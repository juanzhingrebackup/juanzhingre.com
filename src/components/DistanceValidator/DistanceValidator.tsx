import React, { useState, useEffect } from 'react';
import googleMapsService from '../../services/googleMapsService';
import './DistanceValidator.css';

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

  useEffect(() => {
    if (!address || address.length < 5) {
      setValidationResult(null);
      onValidationResult(true); // Don't block if no address yet
      return;
    }

    // Only validate if user has selected an address from autocomplete
    if (!isAddressSelected) {
      setValidationResult(null);
      onValidationResult(true); // Don't block if user is still typing
      return;
    }

    const validateDistance = async () => {
      setIsValidating(true);
      try {
        await googleMapsService.initialize();
        const result = await googleMapsService.calculateDistance(businessLocation, address);
        
        const isValid = result.distance <= 10; // 10 miles limit
        const validation = {
          isValid,
          distance: result.distance
        };
        
        setValidationResult(validation);
        onValidationResult(isValid, result.distance);
      } catch (error) {
        console.error('Distance validation error:', error);
        const validation = {
          isValid: false,
          error: 'Unable to validate distance'
        };
        setValidationResult(validation);
        onValidationResult(false);
      } finally {
        setIsValidating(false);
      }
    };

    // Validate immediately when address is selected
    validateDistance();
  }, [address, businessLocation, onValidationResult, isAddressSelected]);

  if (!address || address.length < 5) {
    return null;
  }

  // Don't show anything if we're still validating or if there's no result yet
  if (isValidating || !validationResult) {
    return null;
  }

  // Only show error message if address is outside service area
  if (validationResult && !validationResult.isValid) {
    return (
      <div className="distance-validator">
        <div className="validation-status invalid">
          <span className="status-icon">✗</span>
          <span className="status-text">
            {validationResult.error ? (
              validationResult.error
            ) : (
              `Outside service area (${validationResult.distance?.toFixed(1)} miles) - Must be 10 miles within Provo, UT`
            )}
          </span>
        </div>
      </div>
    );
  }

  // Don't show anything if address is valid (within service area)
  // The green checkmark will be shown by the AddressAutocomplete component
  return null;
}; export default DistanceValidator;