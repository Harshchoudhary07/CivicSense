import React, { useEffect, useRef, useState } from 'react';

const Map = ({ center, zoom = 15, markers = [], onLocationSelect, height = '400px' }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [googleMaps, setGoogleMaps] = useState(null);
    const markersRef = useRef([]);

    useEffect(() => {
        // Load Google Maps Script
        const loadGoogleMaps = () => {
            if (window.google && window.google.maps) {
                setGoogleMaps(window.google.maps);
                return;
            }

            const existingScript = document.getElementById('google-maps-script');
            if (existingScript) {
                existingScript.addEventListener('load', () => {
                    setGoogleMaps(window.google.maps);
                });
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setGoogleMaps(window.google.maps);
            };
            document.head.appendChild(script);
        };

        loadGoogleMaps();
    }, []);

    useEffect(() => {
        if (!googleMaps || !mapRef.current) return;

        if (!map) {
            const newMap = new googleMaps.Map(mapRef.current, {
                center: center || { lat: 20.5937, lng: 78.9629 }, // Default to India
                zoom: zoom,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ],
                mapTypeControl: false,
                streetViewControl: false,
            });

            newMap.addListener('click', (e) => {
                if (onLocationSelect) {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    onLocationSelect({ lat, lng });
                }
            });

            setMap(newMap);
        } else {
            if (center) {
                map.panTo(center);
            }
        }
    }, [googleMaps, map, center, zoom, onLocationSelect]);

    // Manage Markers
    useEffect(() => {
        if (!map || !googleMaps) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add new markers
        markers.forEach(markerData => {
            const marker = new googleMaps.Marker({
                position: { lat: markerData.lat, lng: markerData.lng },
                map: map,
                title: markerData.title,
                animation: googleMaps.Animation.DROP,
            });

            if (markerData.onClick) {
                marker.addListener('click', () => markerData.onClick());
            }

            // Add InfoWindow if provided
            if (markerData.infoContent) {
                const infoWindow = new googleMaps.InfoWindow({
                    content: markerData.infoContent
                });
                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
            }

            markersRef.current.push(marker);
        });

    }, [map, googleMaps, markers]);

    return (
        <div ref={mapRef} style={{ width: '100%', height: height, borderRadius: 'var(--radius-xl)' }} />
    );
};

export default Map;
