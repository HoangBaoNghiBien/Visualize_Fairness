'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const Map = dynamic(() => import('./MapComponent/Map'), { ssr: false });
const Navbar = dynamic(() => import('./NavbarComponent/Navbar'), { ssr: false });
const Sidebar = dynamic(() => import('./InputComponent/Sidebar'), { ssr: false });

export default function Home() {
  const [dataset, setDataset] = useState('');
  const [fileLink, setFilelink] = useState('');

  const [devices, setDevices] = useState([{
    id: Date.now(),
    type: 'address',
    name: '',
    address: '',
    city: '',
    zipcode: '',
    longitude: '',
    latitude: ''
  }]);

  console.log(devices)

  // Make sure the state change logic is correct
  const handleDatasetChange = (newDataset) => {
    setDataset(newDataset);
    console.log("Dataset updated:", newDataset);
  };

  return (
    <div className="main-container">
      {/* <Navbar /> */}
      <Sidebar onDatasetChange={handleDatasetChange} devices={devices} setDevices={setDevices} />
      <Map dataset={dataset} devices={devices} />
    </div>
  );
}
