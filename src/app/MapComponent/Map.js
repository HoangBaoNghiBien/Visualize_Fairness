'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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

const Map = ({ dataset }) => {
    const [geojson, setGeojson] = useState(null);
    const [error, setError] = useState('');

    // useEffect(() => {
    //     if (dataset) {
    //         fetchDataset(dataset).catch(err => {
    //             setError(`Failed to load the dataset: ${err.message}`);
    //         });
    //     }
    // }, [dataset]);
    useEffect(() => {
        if (dataset) {
            const fileExtension = dataset.split('.').pop();
            fetchDataset(dataset, fileExtension).catch(err => {
                setError(`Failed to load the dataset: ${err.message}`);
            });
        }
    }, [dataset]);

    const fetchDataset = async (dataset, fileExtension) => {
        let response = await fetch(`/dataset/${dataset}`);
        if (!response.ok) throw new Error('Network response was not ok.');

        switch (fileExtension) {
            case 'csv':
                let text = await response.text();
                setGeojson(convertCSVToGeoJSON(text));
                break;
            case 'xlsx':
                let arrayBuffer = await response.arrayBuffer();
                setGeojson(convertXLSXToGeoJSON(arrayBuffer));
                break;
            default:
                let json = await response.json();
                setGeojson(json);
        }
    };

    // useEffect(() => {
    //     if (dataset === 'Hospital') {
    //         fetch('/dataset/Hospital_Locations.geojson')
    //             .then(response => response.json())
    //             .then(data => setGeojson(data));
    //     } else {
    //         setGeojson(null);
    //     }
    // }, [dataset]);


    // useEffect(() => {
    //     if (dataset) {
    //         fetchDataset(dataset);
    //     }
    // }, [dataset]);


    // const fetchDataset = (dataset) => {
    //     let fileExtension = '';
    //     let basePath = '/dataset/'; 

    //     if (dataset === 'Divvy_Bicycle_Stations') {
    //         fileExtension = '.csv';
    //     } else if (dataset === 'School') {
    //         fileExtension = '.xlsx';
    //     } else {
    //         fileExtension = '.geojson';
    //     }

    //     fetch(`${basePath}${dataset}_Locations${fileExtension}`)
    //         .then(response => {
    //             if (fileExtension === '.csv') {
    //                 return response.text();
    //             } else if (fileExtension === '.xlsx') {
    //                 return response.arrayBuffer();
    //             } else {
    //                 return response.json();
    //             }
    //         })
    //         .then(data => {
    //             if (fileExtension === '.csv') {
    //                 const geojsonData = convertCSVToGeoJSON(data);
    //                 setGeojson(geojsonData);
    //             } else if (fileExtension === '.xlsx') {
    //                 const geojsonData = convertXLSXToGeoJSON(data);
    //                 setGeojson(geojsonData);
    //             } else {
    //                 setGeojson(data);
    //             }
    //         });
    // };

    // const fetchDataset = async (dataset) => {
    //     let fileExtension = dataset === 'Divvy_Bicycle_Stations' ? '.csv' : dataset === 'School' ? '.xlsx' : '.geojson';
    //     let response = await fetch(`/dataset/${dataset}${fileExtension}`);
    //     if (!response.ok) throw new Error('Network response was not ok.');

    //     if (fileExtension === '.csv') {
    //         let text = await response.text();
    //         setGeojson(convertCSVToGeoJSON(text));
    //     } else if (fileExtension === '.xlsx') {
    //         let arrayBuffer = await response.arrayBuffer();
    //         setGeojson(convertXLSXToGeoJSON(arrayBuffer));
    //     } else {
    //         let json = await response.json();
    //         setGeojson(json);
    //     }
    // };

    {/* -- Convert CSV to GeoJSON --
        1. Parse CSV data using Papa.parse() method.
        2. Map each row to a GeoJSON feature.
            - Each feature has a type, geometry, and properties.
            - The geometry is a Point with coordinates, with the longitude and latitude from the CSV.
            - The properties are the columns from the CSV.
        3. Return a GeoJSON object with features.
    */}
    // const convertCSVToGeoJSON = (csvData) => {
    //     const parsedData = Papa.parse(csvData, { header: true });
    //     const features = parsedData.data.map(row => ({
    //         type: "Feature",
    //         geometry: {
    //             type: "Point",
    //             coordinates: [parseFloat(row.Longitude), parseFloat(row.Latitude)]
    //         },
    //         properties: { ...row }
    //     }));
    //     return {
    //         type: "FeatureCollection",
    //         features: features
    //     };
    // };
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
            </MapContainer>
        </div>
    );
};

export default Map;
