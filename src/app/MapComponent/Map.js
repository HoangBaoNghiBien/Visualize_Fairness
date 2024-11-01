'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios'
import './Map.css';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'
import "leaflet/dist/leaflet.css";
import Device from '../Device';



const locationIcon = new L.Icon({
    iconUrl: '/blue_pin.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const addLocationIcon = new L.Icon({
    iconUrl: '/green_pin.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const removeLocationIcon = new L.Icon({
    iconUrl: '/grey_pin.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const selectedLocationIcon = new L.Icon({
    iconUrl: '/red_pin.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#888888'];
const COLORS = {
    'White': '#0088FE', // Blue
    'Black': '#00C49F', // Green
    'Asian': '#FFBB28', // Yellow
    'Mixed Races': '#FF8042', // Orange
    'Other Races': '#888888' // Grey
};

function getColor(name) {
    return COLORS[name];
}

export function createFormDataFromFile(converted_file, fileType, fileName, dataset) {
    // Create a Blob from the converted file
    const blob = new Blob([JSON.stringify(converted_file)], { type: fileType });

    // Log Blob and fileName for debugging
    console.log(blob);
    console.log(fileName);

    // Create FormData and append the Blob
    const formData = new FormData();
    formData.append('file', blob, fileName);

    // Create a file name with '.geojson' extension
    const file_name = dataset.split('.')[0] + ".geojson";

    // Return the FormData and file name
    return { formData, file_name };
}

export const uploadConvertedFile = async (filename, formData) => {
    try {
        const response = await axios.post('http://localhost:3000/upload', formData)
    } catch (error) {
        console.error('Error uploading converted file:', error);
    }
};

const Map = ({ dataset, devices, geojson, setGeojson }) => {

    // const [geojson, setGeojson] = useState(null);
    const [error, setError] = useState('');
    // const [circle, setCircle] = useState(null);
    const [map, setMap] = useState(null);
    // const [center, setCenter] = useState([41.8781, -87.6298]); // Use Chicago's coordinates as default
    const [radius, setRadius] = useState(200);
    const [circleCenter, setCircleCenter] = useState(null);

    const [equityData, setEquityData] = useState('Loading...');
    const [coverage, setCoverage] = useState('3 miles');
    const [coverageData, setCoverageData] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);



    useEffect(() => {
        if (dataset) {
            // Reset coverage data when a new dataset is selected
            setCoverageData(null);
            setCircleCenter(null);
            setEquityData('Loading...');

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
            const { formData, file_name } = createFormDataFromFile(converted_file, fileType, fileName, dataset);
            await uploadConvertedFile(file_name, formData)
            const response = await axios.delete(`http://localhost:3000/temp/${dataset}`)
        }

        setGeojson(converted_file);

        var object =
        {
            "people": "fairness/IL_dataset_50thousand-2.csv",
            "locations": response.url,
            "groupA": "P1_003N",
            "groupB": "P1_004N"
        }

        const blob = new Blob([JSON.stringify(object)], { type: fileType });
        const formData = new FormData();
        console.log(blob)
        console.log(fileName)
        formData.append('file', blob, 'config.json');
        await axios.post('http://localhost:3000/upload/fairness', formData)
        
        setTimeout(() => {
            axios.get('http://localhost:3000/run-python')
                .then(response => {
                    console.log(response.data)
                    // setEquityData(`Equity: ${JSON.stringify(response.data)}`);

                    const disparityValue = parseFloat(response.data.output);
                    setEquityData(`${disparityValue.toFixed(4)}`);
                })
                .catch(error => {
                    console.log(error)
                    setEquityData('Failed to load equity data');
                })
        }, 2000)
        // setEquityData(`Equity: ${response.data}`);
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
    // taking device and add them in newgeojson
    useEffect(() => {
        let newGeojson = { ...geojson, devices: [] };
        let empty = true;
        // 41.8731453817664, -87.65944817787462
        devices.forEach(device => {
            if (device.latitude && device.longitude) {
                empty = false;
                newGeojson.devices.push(new Device(device.longitude, device.latitude).json());
            }
        });
    
        if (empty) {
            newGeojson.devices = [];
        }
        setGeojson(newGeojson);
    
    }, [devices]);


    // TAKE % OF EACH RACE AND DISPLAY ON CONSOLE LOG
    const handleMarkerClick = async (e) => {
        setSelectedPoint(e);
        const { lat, lng } = e.latlng;
        console.log(`Clicked marker at latitude: ${lat}, longitude: ${lng}`);
        setCircleCenter({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            radius: 200 // Or any other radius you wish to use
        });

        const object2 = {
            "people": "fairness/IL_dataset_50thousand-2.csv",
            longitude: lng.toString(),
            latitude: lat.toString(),
            "radius_miles": "3"
        };
        

        const blob = new Blob([JSON.stringify(object2)], { type: 'application/json'});
        const formData2 = new FormData();
        // console.log(blob)
        // console.log(fileName)
        formData2.append('file', blob, 'config2.json');
        await axios.post('http://localhost:3000/upload/fairness', formData2)

        setTimeout(() => {
            axios.get('http://localhost:3000/run-python-coverage')
                .then(response => {
                    console.log(response.data.output);
                    // const disparityValue = parseFloat(response.data.output);
                    // setCoverageData(`${response.data.output}`);
                    
                    const data = JSON.parse(response.data.output);
                    console.log(data['demographic_percentages']);
                    setCoverageData(data['demographic_percentages']); 
                })
                .catch(error => {
                    console.log(error)
                })
        }, 2000)
    };

    const pieData = coverageData ? Object.entries(coverageData).map(([key, value], index) => ({
        name: key,
        value: parseFloat(value)
    })) : [];


    return (
        // <div></div>
        <div className="map-container">
            <MapContainer 
                center={[41.8781, -87.6298]} 
                zoom={13} 
                style={{ height: '100vh', width: '100%' }}
            >

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* <Circle center={center} fillColor="blue" radius={radius} /> */}
                {circleCenter && <Circle center={circleCenter} radius={radius} fillColor="blue" color="red" />}
                {geojson && geojson.features && geojson.features.map((feature, index) => {
                    const icon = locationIcon
                    // Return the JSX for Marker
                    return (
                        <Marker
                            key={index}
                            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                            icon={icon}  // Use the conditional icon
                            eventHandlers={{
                                click: handleMarkerClick,
                            }}
                        >

                            {/* <Popup> */}
                                {/* You can customize the popup content here */}
                                {/* <b>{feature.properties.name || 'No name'}</b><br />
                                {feature.properties.address || 'No address'} */}
                            {/* </Popup> */}
                        </Marker>
                    );
                }
                )}

                {geojson && geojson.devices && geojson.devices.map((feature, index) => {
                    const icon = addLocationIcon
                    // Return the JSX for Marker
                    return (
                        <Marker
                            key={index}
                            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                            icon={icon}  // Use the conditional icon
                            eventHandlers={{
                                click: handleMarkerClick,
                            }}
                        >
                            <Popup>
                                {/* You can customize the popup content here */}
                                {/* <b>{feature.properties.name || 'No name'}</b><br />
                                {feature.properties.address || 'No address'} */}
                            </Popup>
                        </Marker>
                    );
                }
                )}

                {geojson && geojson.features && geojson.features.map((feature, index) => {
                    const isSelected = selectedPoint &&
                        selectedPoint.latlng.lat === feature.geometry.coordinates[1] &&
                        selectedPoint.latlng.lng === feature.geometry.coordinates[0];
                    const icon = isSelected ? selectedLocationIcon : locationIcon;

                    return (
                        <Marker
                            key={index}
                            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                            icon={icon}
                            eventHandlers={{
                                click: handleMarkerClick,
                            }}
                        >
                            {/* Popup or other content can go here */}
                        </Marker>
                    );
                })}

                <div className="details-panel">
                    <button
                        className="close-btn"
                        onClick={() => {
                            setCoverageData(null);
                            setSelectedPoint(null);
                            // setEquityData('Loading...');
                        }}
                    >
                        &times;
                    </button>

                    <h2>Details</h2>
                    <div className="text-details">
                        {/* {equityData !== 'Loading...' && (
                            <>
                                <p><strong>Equity:</strong> {equityData || 'N/A'}</p>
                                <p><strong>Coverage:</strong> {coverage}</p>
                                <p>Select a point on the map to see coverage by race.</p>
                            </>
                        )} */}
                                <p><strong>Equity:</strong> {equityData || 'N/A'}</p>
                                {equityData !== 'Loading...' && (
                                    <>
                                        <p><strong>Coverage:</strong> {coverage}</p>
                                        <p>Select a point on the map to see coverage by race.</p>
                                    </>
                                )}
                    </div>
                    
                    {coverageData && (
                        <div className="chart-details">
                            <p><strong>Race Percentages:</strong></p>
                            
                                <div className="pie-chart-container">
                                    <PieChart width={400} height={350}>
                                        <Pie
                                            data={pieData}
                                            cx={200}
                                            cy={150}
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                                            ))}
                                        </Pie>
                                        <Tooltip className="pie-chart-tooltip" />
                                        <Legend className="pie-chart-legend" />
                                    </PieChart>
                                </div>
                        </div>
                    )}
                    
                </div>

            </MapContainer>

        </div>
    );
};

export default Map;