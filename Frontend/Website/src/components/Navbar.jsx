import React from 'react';
import logo from '../assets/img/icon/icon-circuits.png';
import '../assets/css/Navbar.css';
import { NavLink, useLocation } from 'react-router-dom';
import "../assets/css/Hero.css";

const Navbar = () => {

    const location = useLocation();

    // Define all the paths that belong to "Services"
    const servicePaths = [
        "/pcb-design",
        "/fabrication",
        "/assembly",
        "/mechanical-design"
    ];

    // Check if the current path matches any of the service routes
    const isServiceActive = servicePaths.includes(location.pathname);

    return (
        <div className="container-fluid sticky-top bg-white shadow-sm">
            <div className="container">
                <nav className="navbar navbar-expand-lg navbar-light p-0">
                    {/* Logo */}
                    <NavLink to="/" className="navbar-brand d-flex align-items-center">
                        <img
                            src={logo}
                            alt="IconCircuits"
                            style={{ width: '170px', paddingTop: '5px' }}
                        />
                    </NavLink>

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        className="navbar-toggler ms-auto"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarCollapse"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Links */}
                    <div className="collapse navbar-collapse" id="navbarCollapse">
                        <div className="navbar-nav ms-auto">
                            <NavLink to="/" end className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
                            <NavLink to="/about" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`}>About</NavLink>

                            {/* Dropdown */}
                            <div className="nav-item dropdown">
                                <NavLink to="/pcb-design" className={`nav-link dropdown-toggle ${isServiceActive ? "active" : ""}`} data-bs-toggle="dropdown">Services</NavLink>
                                <div className="dropdown-menu bg-light mt-2">
                                    <NavLink to="/pcb-design" className="dropdown-item">PCB Design</NavLink>
                                    <NavLink to="/fabrication" className="dropdown-item">Fabrication</NavLink>
                                    <NavLink to="/assembly" className="dropdown-item">Assembly</NavLink>
                                    <NavLink to="/mechanical-design" className="dropdown-item">Mechanical Design</NavLink>
                                </div>
                            </div>

                            <NavLink to="/contact" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
                        </div>

                        {/* Search Button */}
                        <button
                            type="button"
                            className="btn text-primary p-0 d-none d-lg-block"
                            data-bs-toggle="modal"
                            data-bs-target="#searchModal"
                        >
                            <i className="fa fa-search"></i>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Scrolling Text Section */}
            <div className="ticker-container bg-light py-2 border-top border-bottom">
                <div className="ticker-content">
                    <p>🚀 Welcome to <strong>Icon Circuits</strong> — India’s trusted PCB design and manufacturing partner. 🧩 We specialize in high-quality PCB fabrication, assembly, and custom circuit solutions for your next innovation.</p>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
