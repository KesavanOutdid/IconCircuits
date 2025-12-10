import logo from '../assets/img/icon/icon-circuits.png';
import '../assets/css/Navbar.css';
import { NavLink, useLocation } from 'react-router-dom';
import "../assets/css/Hero.css";
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const location = useLocation();
    const isAccountPage = ["/profile", "/orders", "/cart"].includes(location.pathname);

    const { user, logout } = useAuth();
    const { cartSummary, clearCartLocal } = useCart();

    const handleLogout = () => {
        clearCartLocal();
        logout();
    };

    const handleSearchClick = () => {
        try {
            const searchModal = document.getElementById('searchModal');
            if (searchModal) {
                const modal = new window.bootstrap.Modal(searchModal);
                modal.show();
            }
        } catch (err) {
            console.error('Search modal error:', err);
        }
    };

    // Define all the paths that belong to "Services"
    const servicePaths = [
        "/pcb-design",
        "/fabrication",
        "/assembly",
        "/mechanical-design"
    ];

    // Check if the current path matches any of the service routes
    const isServiceActive = servicePaths.includes(location.pathname);

    // Define all the paths that belong to "Services"       
    const servicePathsPCB = [
        "/pcb-layout",
        "/pcb-fabrication",
        "/pcb-assembly",
        "/pcb-stencil",
        "/pcb-component-sourcing"
    ];
    
    // Check if the current path matches any of the service routes
    const isServiceActivePCB = servicePathsPCB.includes(location.pathname);

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
                                <NavLink to="/pcb-layout" className={`nav-link dropdown-toggle ${isServiceActivePCB ? "active" : ""}`} data-bs-toggle="dropdown">PCB Services</NavLink>
                                <div className="dropdown-menu bg-light mt-2">
                                    <NavLink to="/pcb-layout" className={`dropdown-item ${location.pathname === "/pcb-layout" ? "active" : ""}`}>PCB Layout</NavLink>
                                    {/* <NavLink to="/pcb-fabrication" className={`dropdown-item ${location.pathname === "/fabrication" ? "active" : ""}`}>PCB Fabrication</NavLink>
                                    <NavLink to="/pcb-assembly" className={`dropdown-item ${location.pathname === "/assembly" ? "active" : ""}`}>PCB Assembly</NavLink>
                                    <NavLink to="/pcb-stencil" className={`dropdown-item ${location.pathname === "/pcb-stencil" ? "active" : ""}`}>PCB Stencil</NavLink>
                                    <NavLink to="/pcb-component-sourcing" className={`dropdown-item ${location.pathname === "/pcb-component-sourcing" ? "active" : ""}`}>Component Sourcing</NavLink> */}
                                </div>
                            </div>

                            {/* Dropdown */}
                            <div className="nav-item dropdown">
                                <NavLink to="/pcb-design" className={`nav-link dropdown-toggle ${isServiceActive ? "active" : ""}`} data-bs-toggle="dropdown">Services</NavLink>
                                <div className="dropdown-menu bg-light mt-2">
                                    <NavLink to="/pcb-design" className={`dropdown-item ${location.pathname === "/pcb-design" ? "active" : ""}`}>PCB Design</NavLink>
                                    <NavLink to="/fabrication" className={`dropdown-item ${location.pathname === "/fabrication" ? "active" : ""}`}>Fabrication</NavLink>
                                    <NavLink to="/assembly" className={`dropdown-item ${location.pathname === "/assembly" ? "active" : ""}`}>Assembly</NavLink>
                                    <NavLink to="/mechanical-design" className={`dropdown-item ${location.pathname === "/mechanical-design" ? "active" : ""}`}>Mechanical Design</NavLink>
                                </div>
                            </div>

                            <NavLink to="/contact" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
                        </div>

                        {/* Auth Links & Cart */}
                        <div className="navbar-auth-section">
                            {user ? (
                                <div className="nav-item dropdown">
                                    <button
                                        className={`nav-link dropdown-toggle user-menu-toggle ${isAccountPage ? "active-user" : ""}`}
                                        data-bs-toggle="dropdown"
                                        style={{ border: 'none', background: 'none', padding: '0.5rem 0', cursor: 'pointer' }}
                                    >
                                        <i className="fa fa-user-circle"></i>
                                        {user.name && <span className="ms-2">{user.name}</span>}
                                        {/* {user.name && <span className="ms-2">{user.name.split(' ')[0]}</span>} */}
                                    </button>
                                    <div className="dropdown-menu dropdown-menu-end bg-light mt-2">
                                        <NavLink
                                            to="/profile"
                                            className={({ isActive }) => `dropdown-item ${isActive ? "active-account-link" : ""}`}
                                        >
                                            <i className="fa fa-user me-2"></i>My Profile
                                        </NavLink>

                                        <NavLink
                                            to="/orders"
                                            className={({ isActive }) => `dropdown-item ${isActive ? "active-account-link" : ""}`}
                                        >
                                            <i className="fa fa-shopping-bag me-2"></i>My Orders
                                        </NavLink>

                                        <NavLink
                                            to="/cart"
                                            className={({ isActive }) => `dropdown-item ${isActive ? "active-account-link" : ""}`}
                                        >
                                            <i className="fa fa-shopping-cart me-2"></i>Cart
                                        </NavLink>

                                        <hr className="dropdown-divider" />
                                        <button 
                                            onClick={handleLogout}
                                            className="dropdown-item"
                                            data-logout="true"
                                            style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                                        >
                                            <i className="fa fa-sign-out me-2"></i>Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <NavLink to="/login" className="nav-link-auth login-link">
                                        <i className="fa fa-sign-in-alt me-1"></i>Login
                                    </NavLink>
                                    <NavLink to="/register" className="nav-link-auth register-link">
                                        <i className="fa fa-user-plus me-1"></i>Register
                                    </NavLink>
                                </>
                            )}

                            {/* Cart Icon */}
                            <NavLink to="/cart" className="nav-link-cart">
                                <i className="fa fa-shopping-cart"></i>
                                {cartSummary.totalItems > 0 && (
                                    <span className="cart-badge">{cartSummary.totalItems}</span>
                                )}
                            </NavLink>

                            {/* Search Button */}
                            <button
                                type="button"
                                className="btn text-primary p-0 d-none d-lg-block ms-2"
                                onClick={handleSearchClick}
                            >
                                <i className="fa fa-search"></i>
                            </button>
                        </div>
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
