'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './Management.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


const ManagementPage = () => {
    const [datasets, setDatasets] = useState([]);
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        // // Fetch datasets from the server
        // axios.get('/api/files').then(response => setDatasets(response.data));
        // // Fetch templates from the server
        // axios.get('/api/templates').then(response => setTemplates(response.data));
        axios.get('http://localhost:3000/api/files')
            .then(response => {
                console.log('Datasets loaded:', response.data);  // Debug: Log datasets
                setDatasets(response.data);
            })
            .catch(err => console.error('Failed to load datasets:', err));

        axios.get('http://localhost:3000/api/templates')
            .then(response => setTemplates(response.data))
            .catch(err => console.error('Failed to load templates:', err));
    }, []);

    const handleDelete = (filename) => {
        // Request server to delete a specific file
        axios.delete(`/temp/${filename}`)
            .then(() => setDatasets(datasets.filter(dataset => dataset !== filename)))
            .catch(error => console.error('Delete failed:', error));
    };

    return (
        <div className="management-page">
            <h1>Management Page</h1>
            <div className="template-section">
                <h2>Download Template:</h2>
                {/* <ul>
                    <li><a href="/templates/template.geojson" download>GeoJSON Template</a></li>
                    <li><a href="/templates/template.xlsx" download>XLSX Template</a></li>
                    <li><a href="/templates/template.csv" download>CSV Template</a></li>
                </ul> */}
                <div className="template-description">
                    Our site offers downloadable templates in GeoJSON, XLSX, and CSV formats to assist you in preparing your datasets accurately.
                    These templates are structured to guide you in compiling data that adheres to the required specifications for upload.
                    By using these templates, you ensure that your data is correctly formatted from the start, facilitating a more efficient upload process. This helps in avoiding common errors that could arise from incorrect data structuring.
                </div>
                <div className="template-buttons">
                    {/* <button onClick={() => window.location.href = '/templates/template.geojson'}>Download GeoJSON</button> */}
                    <button style={{ cursor: 'pointer' }} onClick={() => {
                        const a = document.createElement("a");
                        a.href = '/templates/template.geojson';
                        a.download = 'template.geojson';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }}>
                        GeoJSON Template
                    </button>
                    <button onClick={() => window.location.href = '/templates/template.xlsx'}>XLSX Template</button>
                    <button onClick={() => window.location.href = '/templates/template.csv'}>CSV Template</button>
                </div>
            </div>
            <div className="dataset-section">
                <h2>Manage Datasets:</h2>
                <div className="table-responsive">
                {/* {datasets.map(dataset => (
                    <div key={dataset}>
                        {dataset}
                        <a href={`/dataset/${dataset}`} download>Download</a>
                        <button onClick={() => handleDelete(dataset)}>Delete</button>
                    </div>
                ))} */}
                    <table>
                        <thead>
                            <tr>
                                <th>Dataset Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datasets.map(dataset => (
                                <tr key={dataset}>
                                    <td>{dataset}</td>
                                    {/* <td>
                                        <a href={`/dataset/${dataset}`} download>Download</a>
                                        <button onClick={() => handleDelete(dataset)}>Delete</button>
                                    </td> */}
                                    <td>
                                        {/* <button className="download-button">
                                            <a href={`/dataset/${dataset}`} download>Download</a>
                                        </button>
                                        <button className="delete-button" onClick={() => handleDelete(dataset)}>
                                            Delete
                                        </button> */}
                                        <button className="button download-button action-button">
                                            <i className="fa fa-download icon"></i> Download
                                        </button>
                                        <button className="button delete-button action-button">
                                            <i className="fa fa-trash icon"></i> Delete
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagementPage;
