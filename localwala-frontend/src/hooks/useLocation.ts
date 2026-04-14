// src/hooks/useLocation.ts
import { useState, useEffect } from "react";

export interface LocationState {
    lat: number;
    lng: number;
    accuracy?: number;
    label: string;        // short display label e.g. "Banjara Hills"
    city: string;         // city name e.g. "Hyderabad"
    fullAddress: string;  // full readable address
    loading: boolean;
    error: string | null;
}

const DEFAULT: LocationState = {
    lat: 17.385,
    lng: 78.4867,
    label: "Banjara Hills",
    city: "Hyderabad",
    fullAddress: "Banjara Hills, Hyderabad, Telangana",
    loading: true,
    error: null,
};

async function reverseGeocode(lat: number, lng: number) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`;
        const res = await fetch(url, {
            headers: {
                // Nominatim requires a User-Agent identifying your app
                "User-Agent": "LocalWala/1.0 (localwala.app)",
                "Accept-Language": "en",
            },
        });

        if (!res.ok) throw new Error(`Nominatim ${res.status}`);

        const data = await res.json();
        const a = data.address ?? {};

        const label =
            a.suburb ||
            a.neighbourhood ||
            a.city_district ||
            a.quarter ||
            a.village ||
            a.town ||
            a.city ||
            "Your Location";

        const city =
            a.city ||
            a.town ||
            a.county ||
            a.state_district ||
            a.state ||
            "Unknown City";

        const fullAddress = [label, city, a.state, a.country]
            .filter(Boolean)
            .join(", ");

        return { label, city, fullAddress };
    } catch (err) {
        console.warn("Reverse geocode failed:", err);
        return { label: "Your Location", city: "Unknown", fullAddress: "Location detected" };
    }
}

export function useLocation(): LocationState {
    const [state, setState] = useState<LocationState>(DEFAULT);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (!navigator.geolocation) {
            setState((p) => ({
                ...p,
                loading: false,
                error: "Geolocation not supported",
                label: "Banjara Hills",
                city: "Hyderabad",
                fullAddress: "Banjara Hills, Hyderabad",
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng, accuracy } = pos.coords;
                console.log("📍 GPS coords:", lat, lng, "accuracy:", accuracy + "m");

                // Show coords immediately while geocoding
                setState((p) => ({ ...p, lat, lng, accuracy, loading: true }));

                const { label, city, fullAddress } = await reverseGeocode(lat, lng);
                console.log("🏙️ Location resolved:", label, city);

                setState({
                    lat, lng, accuracy,
                    label, city, fullAddress,
                    loading: false,
                    error: null,
                });
            },
            (err) => {
                console.warn("Geolocation error:", err.code, err.message);
                // Fall back to Hyderabad default silently
                setState({
                    ...DEFAULT,
                    loading: false,
                    error: err.message,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5 * 60 * 1000, // cache 5 mins
            }
        );
    }, []);

    return state;
}