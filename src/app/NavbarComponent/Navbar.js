import React from 'react';
import Link from "next/link";
import './Navbar.css';

const Navbar = () => (
    <nav className="nav">
        <a className="nav-link" href="/">Home</a>
        <a className="nav-link" href="/management-page">Management</a>
        <a className="nav-link" href="/guide-page">Guide</a>
    </nav>
    // <ul className="nav">
    //     <li>
    //         <Link href="/">
    //             <p className="nav-link">Home</p>
    //         </Link>
    //     </li>
    //     <li>
    //         <Link href="/template">
    //             <p className="nav-link">Template</p>
    //         </Link>
    //     </li>
    //     <li>
    //         <Link href="/guide-page">
    //             <p className="nav-link">Guide</p>
    //         </Link>
    //     </li>
    // </ul>
);

export default Navbar;
