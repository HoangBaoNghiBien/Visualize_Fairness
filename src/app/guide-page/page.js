import React from "react";
import './Guide.css';

const Guide = () => {
    return (
        <div className="guide-full-width">
            <h1>Welcome to the Geographic Coverage and Equity Analysis Tool</h1>
            <p>
                This tool is designed to help users analyze demographic coverage and equity data within specific areas on a map. You can upload geographic datasets, view data points on the map, and get detailed statistics about demographic percentages within chosen radii around selected points.
            </p>

            <h2>Getting Started</h2>
            <ol>
                <li>
                    <strong>Select a Dataset:</strong>
                    <p>On the right side, you can choose a dataset to load on the map. The tool supports GeoJSON, CSV, and XLSX file formats. Upon selecting a dataset, the data points will appear as markers on the map.</p>
                    {/* <img src="public/GIF/upload2.gif" alt="How to select a dataset" width="600" /> */}
                </li>
                <li>
                    <strong>Add Custom Locations:</strong>
                    <p>Use the "Add Device" section to input custom longitude and latitude coordinates. These points will appear on the map with a unique icon to distinguish them from dataset points.</p>
                </li>
                <li>
                    <strong>Select a Marker:</strong>
                    <p>Click on any marker on the map to view detailed demographic information for that area. This will open a panel at the bottom left of the screen, displaying equity, coverage radius, and a breakdown of race percentages within the specified radius.</p>
                </li>
            </ol>

            <h2>Understanding the Data Display</h2>
            <p>When you click on a marker, you will see a "Details" panel with the following sections:</p>
            <ul>
                <li><strong>Equity:</strong> This value indicates the equity disparity for the selected location.</li>
                <li><strong>Coverage:</strong> The radius used for calculating demographic coverage around the selected point (default is 3 miles).</li>
                <li><strong>Race Percentages:</strong> A pie chart showing the breakdown of demographic percentages for races within the coverage area, color-coded for easy visualization.</li>
            </ul>

            <h2>Features and Tips</h2>
            <ul>
                <li><strong>Responsive Map:</strong> The map is fully interactive and supports zooming, panning, and marker selection. Click on different points to analyze coverage in various areas.</li>
                <li><strong>Clear Data:</strong> To reset data or clear the selected point, click the "X" button on the top-right corner of the "Details" panel. This will remove the current data from view.</li>
                <li><strong>Loading New Datasets:</strong> If you switch to a new dataset, the map will automatically clear previous data and display the new dataset. This ensures you only see relevant information.</li>
            </ul>

            <h2>Troubleshooting</h2>
            <ul>
                <li>If a dataset fails to load, please check the file format. Only GeoJSON, CSV, and XLSX files are supported.</li>
                <li>If demographic data fails to display, verify that the marker you clicked has valid location coordinates and try again.</li>
                <li>If the pie chart appears empty, it may be due to insufficient data within the coverage area.</li>
            </ul>

            {/* <h2>Technical Notes</h2>
            <p>This tool is built with React and Leaflet for interactive mapping. It integrates with a backend API to process datasets and calculate demographic statistics based on user interactions.</p>

            <h2>Contact Support</h2>
            <p>If you encounter issues or have questions, feel free to reach out to our support team.</p> */}
        </div>
    );
};

export default Guide;
