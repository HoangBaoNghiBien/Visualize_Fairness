'use client';

import React, { useState, useEffect, Component } from 'react';
import './Sidebar.css';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'
// import axios from 'axios'

const Sidebar = ({ onDatasetChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dataset, setDataset] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);

    const [filePath, setFilePath] = useState(null)
    const [fileName, setFileName] = useState(null)

    const [datasetOptions, setDatasetOptions] = useState([]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

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
        if (selectedDataset !== 'New Upload') {
            onDatasetChange(selectedDataset); // Notify parent component of the change
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData()
        formData.append("file", filePath);

        fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message); // Show upload success message
                fetchDatasets(); // Re-fetch datasets to include the new upload
            })
            .catch(error => console.error('Error uploading:', error));
    }

    // Function to re-fetch dataset list
    const fetchDatasets = () => {
        fetch('http://localhost:3000/api/files')
            .then(response => response.json())
            .then(data => {
                setDatasetOptions(data.map(file => ({ label: file, value: file })));
            })
            .catch(error => console.error('Error fetching files:', error));
    };

    const handleInputChange = (event) => {
        const file = event.target.files[0]
        // const val = event.target.value
        // // console.log(file)
        // // console.log(val)
        // setFilePath(val)
        // setFileName(file.name)
        if (file) {
            setFilePath(file);
            setFileName(file.name);
        }
    }

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
                        {/* <select value={dataset} onChange={handleDatasetChange}>
                            <option value="" disabled>Select Dataset</option>
                            <option value="Hospital">Hospital</option>
                            <option value="CTA_RailStations">CTA Rail Stations</option>
                            <option value="Divvy_Bicycle_Stations">Divvy Bicycle Stations</option>
                            <option value="School">School</option>
                            <option disabled>──────────</option>
                            <option value="New Upload">New Upload</option>
                        </select> */}
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
                        <input type="text" placeholder="Placeholder" />
                    </label>

                    {/* Device */}
                    <label>
                        Number of device:
                        <input type="text" placeholder="Placeholder" />
                    </label>

                    {/* Place device type */}
                    <div className="radio-container">
                        <label>Place device BY:</label>
                        {/* <label> */}
                        <input type="radio" name="placeBy" value="address" defaultChecked /> Address
                        {/* </label> */}
                        {/* <label> */}
                        <input type="radio" name="placeBy" value="coordinate" /> Coordinate
                        {/* </label> */}
                    </div>
                    <div className="device-info">
                        <h3>Device #:</h3>
                        <label>
                            Address:
                            <input type="text" placeholder="Placeholder" />
                        </label>
                        <label>
                            City:
                            <input type="text" placeholder="Placeholder" />
                        </label>
                        <label>
                            Zipcode:
                            <input type="text" placeholder="Placeholder" />
                        </label>
                    </div>

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