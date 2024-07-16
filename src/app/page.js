'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const Map = dynamic(() => import('./MapComponent/Map'), { ssr: false });
const Navbar = dynamic(() => import('./NavbarComponent/Navbar'), { ssr: false });
const Sidebar = dynamic(() => import('./InputComponent/Sidebar'), { ssr: false });

export default function Home() {
  const [dataset, setDataset] = useState('');
  const [fileLink, setFilelink] = useState('');
  return (
    <div className="main-container">
      <Navbar />
      <Sidebar onDatasetChange={setDataset}/>
      <Map dataset={dataset}/>
    </div>
  );
}
