'use client';

import React, { useState, useEffect, Component } from 'react';
import './Sidebar.css';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'
import axios from 'axios'

const Sidebar = ({ onDatasetChange, onGetLink }) => {
    const [isOpen, setIsOpen] = useState(false);    // Sidebar open/close state
    const [dataset, setDataset] = useState('');     // Selected dataset
    const [showUploadForm, setShowUploadForm] = useState(false);    // Show/hide upload form
    const [serviceAction, setServiceAction] = useState('');     // Selected service action
    const [numDevices, setNumDevices] = useState(1);        // Number of devices
    const [deviceDetails, setDeviceDetails] = useState([]);     // Details of each device
    const [placeBy, setPlaceBy] = useState('coordinate');      // Place device by address or coordinate

    const [filePath, setFilePath] = useState(null)      // Path of the uploaded file
    const [fileName, setFileName] = useState(null)      // Name of the uploaded file
    const [datasetOptions, setDatasetOptions] = useState([]);   // List of available datasets
    const [toDelete, setToDelete] = useState(null);

    // Function to toggle sidebar visibility
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        setDeviceDetails(Array.from({ length: numDevices }, (_, index) => ({ id: index + 1 })));
    }, [numDevices]);

    {/* Dataset change */ }
    // Handle the change between available datasets and new uploads
    // If user selects "New Upload", show the upload form
    // If user selects an existing dataset, notify the parent Component
    //      and hide the upload form
    const handleDatasetChange = (e) => {
        const selectedDataset = e.target.value;
        setDataset(selectedDataset);
        // Toggle the upload form based on whether "New Upload" is selected
        setShowUploadForm(selectedDataset === 'New Upload');
        // If a selected dataset is not "New Upload", notify the parent Component
        if (selectedDataset !== 'New Upload') {
            onDatasetChange(selectedDataset);
        }
    };

    {/* Service action change */ }
    const handleServiceActionChange = (e) => {
        setServiceAction(e.target.value);
    };

    {/* Handle file input change */ }
    const handleInputChange = (event) => {
        const file = event.target.files[0]

        if (file) {
            setFilePath(file);
            setFileName(file.name);
            console.log(file.name)
            const formData = new FormData()
            formData.append("file", file);
            const req = axios.post('http://localhost:3000/upload', formData)
            req.then(response => response.data)
            onDatasetChange(file.name)
            setToDelete(file.name) // if not subimt then we can call request to del
            // http://localhost:3000/temp/:filename(*)
            //
        }
    }


    {/* Handle number of devices change */ }
    const handleNumDevicesChange = (event) => {
        const num = Number(event.target.value);
        setNumDevices(num >= 1 ? num : 1);
    };

    {/* Handle the form submission */ }
    // Send the uploaded file to the server
    //     and notify the parent Component of the change
    const handleSubmit = (event) => {
        const formData = new FormData()
        formData.append("file", filePath);

        const req = axios.post('http://localhost:3000/upload', formData)
        req.then(response => response.data)
    }

    // // Function to re-fetch dataset list
    // const fetchDatasets = () => {
    //     fetch('http://localhost:3000/api/files')
    //         .then(response => response.json())
    //         .then(data => {
    //             setDatasetOptions(data.map(file => ({ label: file, value: file })));
    //         })
    //         .catch(error => console.error('Error fetching files:', error));
    // };



    // Take the file in public/dataset and display it in the dropdown
    useEffect(() => {
        fetch('http://localhost:3000/api/files')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);  // Check what's being returned
                setDatasetOptions(data.map(file => ({ label: file, value: file })));
            })
            .catch(error => console.error('Error fetching files:', error));
    }, []);


    {/* Handle place by change */ }
    const handlePlaceByChange = (event) => {
        setPlaceBy(event.target.value);
    };

    const renderDeviceInputs = (device) => {
        if (placeBy === 'address') {
            return (
                <>
                    <label>Name:
                        <input type="text" placeholder="Name" />
                    </label>
                    <label>Address (*):
                        <input type="text" placeholder="Address" required />
                    </label>
                    <label>City (*):
                        <input type="text" placeholder="City" required />
                    </label>
                    <label>Zipcode (*):
                        <input type="text" placeholder="Zipcode" required />
                    </label>
                </>
            );
        } else {
            return (
                <>
                    <label>Name:
                        <input type="text" placeholder="Name" />
                    </label>
                    <label>Longitude (*):
                        <input type="text" placeholder="Longitude" required />
                    </label>
                    <label>Latitude (*):
                        <input type="text" placeholder="Latitude" required />
                    </label>
                </>
            );
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button className="toggle-button" onClick={toggleSidebar}>
                {isOpen ? '>>' : '<<'}
            </button>
            <div className="content">
                {/* Input form */}
                <h2>Input:</h2>
                <form onSubmit={handleSubmit}>
                    {/* Dataset */}
                    <label>
                        Dataset (*):
                        <select value={dataset} onChange={handleDatasetChange}>
                            <option value="" disabled>Select Dataset</option>
                            {datasetOptions.map(option => (
                                option.value !== 'New Upload' ? (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ) : null
                            ))}
                            <option disabled>──────────</option> {/* This is the separator */}
                            <option value="New Upload">New Upload</option>
                        </select>
                    </label>
                    {showUploadForm && (
                        <div className="upload-form">
                            <label>
                                Upload your dataset (*):
                                <input onChange={handleInputChange} type="file" accept=".csv, .xls, .xlsx, .geojson" />
                            </label>
                        </div>
                    )}

                    {/* Service action */}
                    <label>
                        Service action (*):
                        <select value={serviceAction} onChange={handleServiceActionChange}>
                            <option value="" disabled>Select Service</option>
                            <option value="Add location">Add location</option>
                            <option value="Remove location">Remove location</option>
                        </select>
                    </label>

                    {/* Device details */}
                    {/* Choose the number of devices and provide details for each device. */}
                    <div className="place-device-container">
                        <label>Place device BY:</label>
                        <div className="radio-container">
                            <label>
                                <input type="radio" name="placeBy" value="coordinate" onChange={handlePlaceByChange} checked={placeBy === 'coordinate'} /> Coordinate
                            </label>
                            <label>
                                <input type="radio" name="placeBy" value="address" onChange={handlePlaceByChange} /> Address
                            </label>
                        </div>
                    </div>

                    <div className="number-of-devices">
                        <label>Number of Devices:
                            <input type="number" value={numDevices} onChange={handleNumDevicesChange} min="1" />
                        </label>
                    </div>
                    {deviceDetails.map(device => (
                        <div key={device.id} className="device-info">
                            <h3>Device {device.id}:</h3>
                            {renderDeviceInputs(device)}
                        </div>
                    ))}

                    {/* Buttons */}
                    <div className="buttons">
                        <button type="button" className="cancel-button">Cancel</button>
                        <button type="submit" className="submit-button">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Sidebar;