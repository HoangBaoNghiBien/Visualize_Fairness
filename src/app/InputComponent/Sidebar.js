'use client';

import React, { useState, useEffect, Component, useRef } from 'react';
import './Sidebar.css';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'
import axios from 'axios'
import DeviceForm from './DeviceForm';

const Sidebar = ({ onDatasetChange, devices, setDevices }) => {
    const [isOpen, setIsOpen] = useState(false);    // Sidebar open/close state
    const [dataset, setDataset] = useState('');     // Selected dataset
    const [showUploadForm, setShowUploadForm] = useState(false);    // Show/hide upload form
    const [serviceAction, setServiceAction] = useState('');     // Selected service action
    const [numDevices, setNumDevices] = useState(1);        // Number of devices
    const [deviceDetails, setDeviceDetails] = useState([]);     // Details of each device
    const fileInputRef = useRef(null);

    const [filePath, setFilePath] = useState(null)      // Path of the uploaded file
    const [fileName, setFileName] = useState(null)      // Name of the uploaded file
    const [datasetOptions, setDatasetOptions] = useState([]);   // List of available datasets
    const [toDelete, setToDelete] = useState(null);

    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');

    const handleChange = (id, e) => {
        const { name, value } = e.target;

        if (e.target.name === 'longitude') {
            setLongitude(e.target.value);
        }
        if (e.target.name === 'latitude') {
            setLatitude(e.target.value);
        }
        setDevices((prevDevices) =>
            prevDevices.map((device) =>
                device.id === id ? { ...device, [name]: value } : device
            )
        );
        // setLongitude('');
        // setLatitude('');
    };

    const handleTypeChange = (id, type) => {
        setDevices((prevDevices) =>
            prevDevices.map((device) =>
                device.id === id ? { ...device, type } : device
            )
        );
    };

    const addDevice = () => {
        setDevices((prevDevices) => [
            ...prevDevices,
            {
                id: Date.now(),
                type: 'address',
                name: '',
                address: '',
                city: '',
                zipcode: '',
                longitude: '',
                latitude: ''
            }
        ]);

        setLatitude('');
        setLongitude('');
    };

    const removeDevice = (id) => {
        setDevices((prevDevices) => prevDevices.filter((device) => device.id !== id));
    };

    const renderDeviceInputs = (device) => {
        if (device.type === 'address') {
            return (
                <>
                    <label>Name:
                        <input
                            type="text"
                            name="name"
                            value={device.name}
                            onChange={(e) => handleChange(device.id, e)}
                            placeholder="Name"
                        />
                    </label>
                    <label>Address (*):
                        <input
                            type="text"
                            name="address"
                            value={device.address}
                            onChange={(e) => handleChange(device.id, e)}
                            placeholder="Address"
                            required
                        />
                    </label>
                    <label>City (*):
                        <input
                            type="text"
                            name="city"
                            value={device.city}
                            onChange={(e) => handleChange(device.id, e)}
                            placeholder="City"
                            required
                        />
                    </label>
                    <label>Zipcode (*):
                        <input
                            type="text"
                            name="zipcode"
                            value={device.zipcode}
                            onChange={(e) => handleChange(device.id, e)}
                            placeholder="Zipcode"
                            required
                        />
                    </label>
                </>
            );
        } else {
            return (
                <>
                    <label>Name:
                        <input
                            type="text"
                            name="name"
                            value={device.name}
                            onChange={(e) => handleChange(device.id, e)}
                            placeholder="Name"
                        />
                    </label>
                    <label>Longitude (*):
                        <input
                            type="text"
                            name="longitude"
                            value={device.longitude}
                            onChange={(e) => handleChange(device.id, e)}
                            placeholder="Longitude"
                            required
                        />
                    </label>
                    <label>Latitude (*):
                        <input
                            type="text"
                            name="latitude"
                            value={device.latitude}
                            onChange={(e) => handleChange(device.id, e)}
                            placeholder="Latitude"
                            required
                        />
                    </label>
                </>
            );
        }
    };

    // Function to toggle sidebar visibility
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        setDeviceDetails(Array.from({ length: numDevices }, (_, index) => ({ id: index + 1 })));
    }, [numDevices]);

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

    {/* Handle upload */ }
    const handleInputChange = async (event) => {
        console.log("changed")
        const file = event.target.files[0]

        if (file) {
            setFilePath(file);
            setFileName(file.name);
            console.log(file.name)
            const formData = new FormData()
            formData.append("file", file);
            const req = await axios.post('http://localhost:3000/upload', formData)
            // req.then(response => response.data)
            let temp_file = `${file.name.split('.')[0]}.geojson`
            onDatasetChange(file.name) // settings the uplooaded file
            setToDelete(temp_file) // but we delete the converted file
            // if not subimt then we can call request to del
            // http://localhost:3000/temp/:filename(*)
        }
    }

    const handleSubmit = async (event) => {
        // currently, pressing submit will upload the file to the server
        // handle case where we want to cancel the upload
        // get value by
        const value = event.target.value
        if (value === 'cancel' && toDelete) {
            console.log("hi in cancel")
            let temp_file = `${fileName.split('.')[0]}.geojson`

            const req = await axios.delete(`http://localhost:3000/temp/${temp_file}`)
            console.log("starting to set states to null")
            setToDelete(null)
            setFileName(null)

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            onDatasetChange(null)
            return
        }
        else if (value === 'cancel') {
            // clear out DeviceForm
            setDevices([{
                id: Date.now(),
                type: 'address',
                name: '',
                address: '',
                city: '',
                zipcode: '',
                longitude: '',
                latitude: ''
            }])
            setLongitude('')
            setLatitude('')
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return
        }
        const formData = new FormData()
        if (filePath) {
            formData.append("file", filePath);
            const req = axios.post('http://localhost:3000/upload', formData)
            req.then(response => response.data)
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
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

    const isFilled = longitude === '' || latitude === '';

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
                                <input ref={fileInputRef} onChange={handleInputChange} type="file" accept=".csv, .xls, .xlsx, .geojson" />
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
                    <DeviceForm
                        devices={devices}
                        handleTypeChange={handleTypeChange}
                        renderDeviceInputs={renderDeviceInputs}
                        removeDevice={removeDevice}
                        addDevice={addDevice}
                        isFilled={isFilled}
                    />

                    {/* Buttons */}
                    <div className="buttons">
                        <button type="button" className="cancel-button" onClick={handleSubmit} value="cancel">Cancel</button>
                        <button type="submit" className="submit-button">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Sidebar;