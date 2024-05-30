'use client';

import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button className="toggle-button" onClick={toggleSidebar}>
                {isOpen ? '>>' : '<<'}
            </button>
            <div className="content">
                <h2>Input:</h2>
                <form>
                    <label>
                        Dataset (*):
                        <input type="text" placeholder="Placeholder" />
                    </label>
                    <label>
                        Service action (*):
                        <input type="text" placeholder="Placeholder" />
                    </label>
                    <label>
                        Number of device:
                        <input type="text" placeholder="Placeholder" />
                    </label>
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
