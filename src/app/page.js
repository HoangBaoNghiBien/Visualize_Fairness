'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import Device from './Device';
import {createFormDataFromFile, uploadConvertedFile} from './MapComponent/Map'
// 41.8731453817664, -87.65944817787462
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
  const [geojson, setGeojson] = useState(null);
  
  const uploadGeojson = async () => {
    const newGeojson = geojson;
    if (newGeojson.devices.length > 0) {
      let fileName = `${dataset.split('.')[0]}.geojson`;
      const { formData, file_name } = createFormDataFromFile(newGeojson, 'application/json', fileName, fileName);
      await uploadConvertedFile(file_name, formData);
    }
  };

  const handleDatasetChange = (newDataset) => {
    setDataset(newDataset);
    console.log("Dataset updated:", newDataset);
  };

  return (
    <div className="main-container">
      {/* <Navbar /> */}
      <Sidebar onDatasetChange={handleDatasetChange}
      devices={devices}
      setDevices={setDevices}
      uploadGeojson={uploadGeojson}
      />
      <Map dataset={dataset} devices={devices} geojson={geojson} setGeojson={setGeojson} />
    </div>
  );
}
