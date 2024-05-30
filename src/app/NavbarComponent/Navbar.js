import React from 'react';
import './Navbar.css';

const Navbar = () => (
    <nav className="nav">
        <a className="nav-link" href="/">Home</a>
        <a className="nav-link" href="/template">Template</a>
        <a className="nav-link" href="/guide">Guide</a>
    </nav>
);

export default Navbar;
