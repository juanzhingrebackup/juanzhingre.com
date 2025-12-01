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

    // Async method to initialize the Google Maps API
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
            const data = await response.json();
            apiKey = data.apiKey;
        } catch (error) {
            console.error("Failed to fetch Google Maps API key:", error);
            throw new Error("Failed to load Google Maps API key");
        }

        if (!apiKey) {
            console.error(
                "Google Maps API key not found. Please set GOOGLE_MAPS_KEY in your Vercel environment variables."
            );
            throw new Error("Google Maps API key is required");
        }

        try {
            this.loader = new Loader({
                apiKey: apiKey,
                version: "weekly",
                libraries: ["places"]
            });

            await this.loader.load();

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
            throw error;
        }
    }

    // Async method to get place predictions from the Google Maps API
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

    // Async method to get place details from the Google Maps API
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

    // Async method to calculate the distance between two addresses
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
