'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';

const locationIcon = new L.Icon({
    iconUrl: '/pin.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const Map = () => {
    const [geojson, setGeojson] = useState(null);

    useEffect(() => {
        fetch('/Hospital_Locations.geojson')
            .then(response => response.json())
            .then(data => setGeojson(data));
    }, []);

    return (
        <div className="map-container">
            <MapContainer center={[41.8781, -87.6298]} zoom={13} style={{ height: '100vh', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {geojson && geojson.features.map((feature, index) => (
                    <Marker
                        key={index}
                        position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                        icon={locationIcon}
                    >
                        <Popup>
                            <b>{feature.properties.CFNAME}</b><br />
                            {feature.properties.ADDRESS}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
