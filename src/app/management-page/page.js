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
                // const filteredDatasets = response.data.filter(dataset => !dataset.startsWith('.'));
                // setDatasets(filteredDatasets);
            })
            .catch(err => console.error('Failed to load datasets:', err));

        axios.get('http://localhost:3000/api/templates')
            .then(response => setTemplates(response.data))
            .catch(err => console.error('Failed to load templates:', err));
    }, []);

    const handleDelete = (filename) => {
        console.log("Attempting to delete:", filename); // Debug log
        const confirmed = window.confirm(`Are you sure you want to delete ${filename}?`);
        if (confirmed) {
            axios.delete(`http://localhost:3000/api/files/${filename}`)
                .then(() => {
                    setDatasets(datasets.filter(dataset => dataset !== filename));
                    alert('File deleted successfully.');
                })
                .catch(error => {
                    console.error('Delete failed:', error);
                    alert('Failed to delete the file.');
                });
        }
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
                        a.href = '/templates/GeoJson_template.geojson';
                        a.download = 'template.geojson';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }}>
                        GeoJSON Template
                    </button>
                    <button onClick={() => window.location.href = '/templates/XLSX_template.xlsx'}>XLSX Template</button>
                    <button onClick={() => window.location.href = '/templates/CSV_template.csv'}>CSV Template</button>
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
                                        {/* Update Download button to link directly to the file URL */}
                                        <a
                                            href={`/dataset/${dataset}`}
                                            download
                                            className="button download-button action-button no-underline"
                                        >
                                            <i className="fa fa-download icon"></i> Download
                                        </a>
                                        {/* <button className="button download-button action-button">
                                            <i className="fa fa-download icon"></i> Download
                                        </button> */}
                                        <button
                                            className="button delete-button action-button"
                                            onClick={() => handleDelete(dataset)}
                                        >
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
