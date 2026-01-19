import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom UV Pin Icon
import pinIconSource from '../assets/pin_uv.png';

const uvIcon = L.icon({
    iconUrl: pinIconSource,
    iconSize: [42, 42],
    iconAnchor: [21, 42], // Center bottom anchor
    popupAnchor: [0, -42]
});

const InteractiveMap = ({ venues }) => {
    const santiagoCenter = [-33.4372, -70.6506];

    return (
        <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <MapContainer
                center={santiagoCenter}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {venues && venues
                    .filter(v => v.location && v.location.lat != null && v.location.lng != null)
                    .map((venue) => (
                        <Marker
                            key={venue.id}
                            position={[venue.location.lat, venue.location.lng]}
                            icon={uvIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2">
                                    <h3 className="font-brand text-uv-noche text-lg">{venue.name}</h3>
                                    <p className="text-xs text-gray-600 mb-2">{venue.category || 'Local'}</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-uv-naranja">★</span>
                                        <span className="text-xs font-bold">{venue.rating_average || 'N/A'}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
            </MapContainer>
        </div>
    );
};

export default InteractiveMap;
