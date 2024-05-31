'use client';

import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ onDatasetChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const[dataset, setDataset] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    {/* Dataset change */}
    const handleDatasetChange = (e) => {
        const selectedDataset = e.target.value;
        setDataset(selectedDataset);
        setShowUploadForm(selectedDataset === 'New Upload');
        onDatasetChange(selectedDataset); // Notify parent component
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button className="toggle-button" onClick={toggleSidebar}>
                {isOpen ? '>>' : '<<'}
            </button>
            <div className="content">
                {/* Input form */}
                <h2>Input:</h2>
                <form>
                   {/* Dataset */}
                    <label>
                        Dataset (*):
                        <select value={dataset} onChange={handleDatasetChange}>
                            <option value="" disabled>Select Dataset</option>
                            <option value="Hospital">Hospital</option>
                            <option value="CTA_BusStops">CTA Bus Stops</option>
                            <option value="CTA_RailStations">CTA Rail Stations</option>
                            <option value="Divvy_Bicycle_Stations">Divvy Bicycle Stations</option>
                            <option value="School">School</option>
                            <option disabled>──────────</option>
                            <option value="New Upload">New Upload</option>
                        </select>
                    </label>
                    {showUploadForm && (
                        <div className="upload-form">
                            <label>
                                Upload your dataset (*):
                                <input type="file" accept=".csv, .xls, .xlsx, .geojson" />
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
