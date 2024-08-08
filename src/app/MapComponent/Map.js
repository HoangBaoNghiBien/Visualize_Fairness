'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios'
import './Map.css';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'
import { Alert } from 'react-bootstrap'; 

const locationIcon = new L.Icon({
    iconUrl: '/pin.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const addLocationIcon = new L.Icon({
    iconUrl: '/red_pin.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});


const Map = ({ dataset, devices }) => {

    
    const [geojson, setGeojson] = useState(null);
    const [error, setError] = useState('');


    useEffect(() => {
        if (dataset) {
            const fileExtension = dataset.split('.').pop();
            fetchDataset(dataset, fileExtension).catch(err => {
                setError(`Failed to load the dataset: ${err.message}`);
            });
        } else {
            setGeojson(null);
        }
    }, [dataset]);

    const fetchDataset = async (dataset, fileExtension) => {
        console.log('fetching dataset runs here')
        let response = await fetch(`/dataset/${dataset}`);
        if (!response.ok) throw new Error('Network response was not ok.');
        let converted_file = null

        let fileType = 'application/json';
        let fileName = `${dataset.split('.')[0]}.geojson`
        
        switch (fileExtension) {
            case 'csv':
                let text = await response.text();
                converted_file = convertCSVToGeoJSON(text)
                break;
            case 'xlsx':
                let arrayBuffer = await response.arrayBuffer();
                converted_file = convertXLSXToGeoJSON(arrayBuffer)
                break;
            default:
                converted_file = await response.json();
        }
        if (fileExtension !== 'geojson') {
            const blob = new Blob([JSON.stringify(converted_file)], { type: fileType });
            const formData = new FormData();
            console.log(blob)
            console.log(fileName)
            formData.append('file', blob, fileName);
            await uploadConvertedFile(dataset.split('.')[0] + ".geojson", formData)
            const response = await axios.delete(`http://localhost:3000/temp/${dataset}`)
        }
        setGeojson(converted_file);
    };

    const uploadConvertedFile = async (filename, formData) => {
        try {
            const response = await axios.post('http://localhost:3000/upload', formData)
        } catch (error) {
            console.error('Error uploading converted file:', error);
        }
    };

    const convertCSVToGeoJSON = (csvData) => {
        const parsedData = Papa.parse(csvData, { header: true }).data;
        return {
            type: "FeatureCollection",
            features: parsedData.map(row => {
                const latitude = parseFloat(row['Latitude']); // Adjust the key to match your CSV header
                const longitude = parseFloat(row['Longitude']); // Adjust the key to match your CSV header
                if (!isNaN(latitude) && !isNaN(longitude)) {
                    return {
                        type: "Feature",
                        properties: row,
                        geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        }
                    };
                }
            }).filter(feature => feature !== undefined)
        };
    };

    {/* -- Convert XLSX to GeoJSON --
        1. Parse XLSX data using XLSX.read() method.
        2. Map each row to a GeoJSON feature.
            - Each feature has a type, geometry, and properties.
            - The geometry is a Point with coordinates, with the longitude and latitude from the XLSX.
            - The properties are the columns from the XLSX.
        3. Return a GeoJSON object with features.
    */}
    const convertXLSXToGeoJSON = (data) => {
        // Read the data into a workbook
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        console.log('worksheet');

        // Convert the worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map the JSON data to GeoJSON format
        const features = jsonData.map(row => {
            const latitude = parseFloat(row['Latitude']);
            const longitude = parseFloat(row['Longitude']);
            if (!isNaN(latitude) && !isNaN(longitude)) {
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    properties: row // Includes all other data as properties
                };
            }
            return null;
        }).filter(feature => feature !== null);

        return {
            type: "FeatureCollection",
            features: features
        };
    };


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
                            {/* <b>{feature.properties.CFNAME}</b><br />
                            {feature.properties.ADDRESS} */}
                            <b>{feature.properties.name || 'No name'}</b><br />
                            {feature.properties.address || 'No address'}
                        </Popup>
                    </Marker>
                ))}

                {devices && devices.map((device, index) => {
                    if (device.type === 'coordinates' && device.latitude && device.longitude) {
                        console.log("in map function")
                        console.log(device)
                        return (
                            <Marker
                                key={device.id}
                                position={[parseFloat(device.latitude), parseFloat(device.longitude)]}
                                icon={addLocationIcon}
                            >
                                <Popup>
                                    <b>{device.name || 'No name'}</b><br />
                                    {device.address || 'No address'}
                                </Popup>
                            </Marker>
                        );
                    }
                })
                }
            </MapContainer>
        </div>
    );
};

export default Map;