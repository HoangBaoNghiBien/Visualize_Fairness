import React, { useState } from 'react';
const DeviceForm = ({ devices, handleTypeChange, renderDeviceInputs, removeDevice, addDevice, isFilled }) => {
    return (
        <div>
            {devices.map((device, index) => (
                <div
                    key={device.id}
                    style={{
                        position: 'relative',
                        marginBottom: '20px',
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#e9e9e9',
                        padding: '10px',
                        borderRadius: '5px'
                    }}
                >
                    <div>
                        <button
                            type="button"
                            onClick={() => handleTypeChange(device.id, 'address')}
                            style={{
                                backgroundColor: device.type === 'address' ? '#007bff' : '#f0f0f0',
                                color: device.type === 'address' ? 'white' : 'black',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                marginRight: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Address
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange(device.id, 'coordinates')}
                            style={{
                                backgroundColor: device.type === 'coordinates' ? '#007bff' : '#f0f0f0',
                                color: device.type === 'coordinates' ? 'white' : 'black',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Coordinates
                        </button>
                    </div>
                    {renderDeviceInputs(device)}
                    {devices.length > 1 &&
                        (<button
                            type="button"
                            onClick={() => removeDevice(device.id)}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'transparent',
                                color: '#888',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}>
                            &times;
                        </button>
                        )}
                    <hr />
                </div>
            ))}
            <button type="button" onClick={addDevice} disabled={isFilled}>Add Device</button>
        </div>
    );
};

export default DeviceForm;
