import { Loader } from "@googlemaps/js-api-loader";
/* global google */

class GoogleMapsService {
    constructor() {
        this.loader = null;
        this.autocompleteService = null;
        this.placesService = null;
        this.distanceMatrixService = null;
        this.isLoaded = false;
    }

    async initialize() {
        if (this.isLoaded) return;

        // Suppress Google Maps deprecation warnings
        const originalWarn = console.warn;
        console.warn = function (...args) {
            if (
                args[0] &&
                typeof args[0] === "string" &&
                (args[0].includes("AutocompleteService") ||
                    args[0].includes("PlacesService"))
            )
                return;
            originalWarn.apply(console, args);
        };

        // Get API key from server-side API route
        let apiKey;
        try {
            const response = await fetch("/api/google-maps/key");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            apiKey = data.apiKey;
        } catch (error) {
            console.error("Failed to fetch Google Maps API key:", error);
            // Restore original console.warn before throwing
            console.warn = originalWarn;
            throw new Error("Failed to load Google Maps API key");
        }

        if (!apiKey) {
            console.error(
                "Google Maps API key not found. Please set GOOGLE_MAPS_KEY in your Vercel environment variables."
            );
            // Restore original console.warn before throwing
            console.warn = originalWarn;
            throw new Error("Google Maps API key is required");
        }

        try {
            this.loader = new Loader({
                apiKey: apiKey,
                version: "weekly",
                libraries: ["places"]
            });

            await this.loader.load();

            // Check if google.maps is available before using it
            if (typeof google === "undefined" || !google.maps || !google.maps.places) {
                throw new Error("Google Maps API failed to load properly");
            }

            this.autocompleteService =
                new google.maps.places.AutocompleteService();
            this.placesService = new google.maps.places.PlacesService(
                document.createElement("div")
            );
            this.distanceMatrixService =
                new google.maps.DistanceMatrixService();
            this.isLoaded = true;

            // Restore original console.warn
            console.warn = originalWarn;
        } catch (error) {
            // Restore original console.warn
            console.warn = originalWarn;
            console.error("Error loading Google Maps API:", error);
            // Reset state on error so it can be retried
            this.isLoaded = false;
            this.loader = null;
            throw error;
        }
    }

    async getPlacePredictions(input, callback) {
        if (!this.isLoaded) {
            await this.initialize();
        }

        const request = {
            input: input,
            types: ["address"],
            componentRestrictions: { country: "us" }
        };

        // Use the newer AutocompleteSuggestion API if available, fallback to old API
        if (this.autocompleteService.getPlacePredictions) {
            this.autocompleteService.getPlacePredictions(request, callback);
        } else {
            // Fallback for newer API
            console.warn("Using fallback for place predictions");
            callback([], "ZERO_RESULTS");
        }
    }

    async getPlaceDetails(placeId, callback) {
        if (!this.isLoaded) {
            await this.initialize();
        }

        const request = {
            placeId: placeId,
            fields: ["formatted_address", "geometry", "address_components"]
        };

        this.placesService.getDetails(request, callback);
    }

    async calculateDistance(origin, destination) {
        if (!this.isLoaded) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            this.distanceMatrixService.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.IMPERIAL,
                    avoidHighways: false,
                    avoidTolls: false
                },
                (response, status) => {
                    if (status === google.maps.DistanceMatrixStatus.OK) {
                        const element = response.rows[0].elements[0];
                        if (
                            element.status ===
                            google.maps.DistanceMatrixElementStatus.OK
                        ) {
                            const distance = element.distance.value; // Distance in meters
                            const distanceInMiles = distance * 0.000621371; // Convert to miles
                            resolve({
                                distance: distanceInMiles,
                                duration: element.duration.text,
                                status: "OK"
                            });
                        } else {
                            reject(new Error("Could not calculate distance"));
                        }
                    } else {
                        reject(new Error("Distance calculation failed"));
                    }
                }
            );
        });
    }
}
export default new GoogleMapsService(); // By John Michael
