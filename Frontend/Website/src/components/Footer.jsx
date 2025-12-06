import React, { useState } from 'react';
import logo from '../assets/img/icon/icon-circuits-white.png';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import "../assets/css/Footer.css"; // Add this CSS file

const Footer = () => {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    // Submit Newsletter
    const handleNewsletterSubmit = async () => {
        if (!newsletterEmail) {
            Swal.fire({
                icon: 'warning',
                title: 'Email Required',
                text: 'Please enter your email to subscribe.'
            });
            return;
        }

        try {
            // Replace with your API endpoint
            await axios.post('/api/newsletter', { email: newsletterEmail });

            Swal.fire({
                icon: 'success',
                title: 'Subscribed!',
                text: 'Thank you for subscribing to our newsletter.',
                confirmButtonText: 'OK'
            });

            setNewsletterEmail('');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Subscription failed! Please try again later.',
            });
        }
    };
    return (
        <div>
            {/* Newsletter Start */}
            <div className="container-fluid bg-primary newsletter py-2">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 ps-lg-0 pt-5 pt-md-0 text-end">
                            <img className="img-fluid" src="/img/newsletter.png" alt="" style={{maxWidth:'35%'}}/>
                        </div>
                        <div className="col-md-6  newsletter-text">
                            <div className="btn btn-sm border rounded-pill text-white px-3 mb-3">Newsletter</div>
                            <h1 className="text-white mb-4">Subscribe to Our Newsletter</h1>
                            <div className="position-relative w-50 mt-3 mb-2">
                                <input className="form-control border-0 rounded-pill w-100 ps-4 pe-5" type="email"
                                    placeholder="Enter your email address" style={{ height: "48px" }}
                                    value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} />
                                <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-1 me-2" onClick={handleNewsletterSubmit}>
                                    <i className="fa fa-paper-plane text-primary fs-4"></i>
                                </button>
                            </div>
                            <small className="text-white-50">Get the latest updates, news, and exclusive offers straight to your inbox.</small>
                        </div>
                    </div>
                </div>
            </div>
            {/* Newsletter End */}
            <div className="container-fluid bg-dark text-white footer pt-5">
                <div className="container">
                    <div className="row g-5">
                        {/* Logo */}
                        <div className="col-md-6 col-lg-3">
                            <Link to="/" className="d-inline-block mb-3">
                                <img
                                    src={logo}
                                    alt="IconCircuits"
                                    style={{ width: "170px", paddingTop: "5px" }}
                                />
                            </Link>
                            <p className="mb-0">Made in India, Wired for the World.</p>
                        </div>

                        {/* Get In Touch */}
                        <div className="col-md-6 col-lg-3">
                            <h5 className="mb-4">Get In Touch</h5>
                            <p>
                                <i className="fa fa-map-marker-alt me-3"></i>
                                2nd Floor, Indian Water Works Association, 10(P), 7th Main Road, BTM Layout, 2nd Stage, MICO HBCS(1st Stage), Bangalore-560076.
                            </p>
                            <p>
                                <i className="fa fa-phone-alt me-3"></i>+91 94481 45256
                            </p>
                            <p>
                                <i className="fa fa-envelope me-3"></i>info@iconcircuits.com
                            </p>
                            <div className="d-flex pt-2">
                                <Link className="btn btn-outline-light btn-social" to="">
                                    <i className="fab fa-twitter"></i>
                                </Link>
                                <Link className="btn btn-outline-light btn-social" to="">
                                    <i className="fab fa-facebook-f"></i>
                                </Link>
                                <Link className="btn btn-outline-light btn-social" to="">
                                    <i className="fab fa-youtube"></i>
                                </Link>
                                <Link className="btn btn-outline-light btn-social" to="">
                                    <i className="fab fa-instagram"></i>
                                </Link>
                                <Link className="btn btn-outline-light btn-social" to="">
                                    <i className="fab fa-linkedin-in"></i>
                                </Link>
                            </div>
                        </div>

                        {/* Popular Links */}
                        <div className="col-md-6 col-lg-3">
                            <h5 className="mb-4">Popular Links</h5>
                            <Link className="btn btn-link" to="/about">
                                About Us
                            </Link>
                            <Link className="btn btn-link" to="/contact">
                                Contact Us
                            </Link>
                            <Link className="btn btn-link" to="">
                                Privacy Policy
                            </Link>
                            <Link className="btn btn-link" to="">
                                Terms & Conditions
                            </Link>
                            <Link className="btn btn-link" to="">
                                Career
                            </Link>
                        </div>

                        {/* Services */}
                        <div className="col-md-6 col-lg-3">
                            <h5 className="mb-4">Our Services</h5>
                            <Link className="btn btn-link" to="">
                                PCB Design
                            </Link>
                            <Link className="btn btn-link" to="">
                                Fabrication
                            </Link>
                            <Link className="btn btn-link" to="">
                                Assembly
                            </Link>
                            <Link className="btn btn-link" to="">
                                Mechanical Design
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="container">
                    <div className="copyright py-3">
                        <div className="row">
                            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                                &copy; {new Date().getFullYear()} <Link className="border-bottom" to="/" style={{ color: "white" }}>Icon Circuits</Link>, All Rights Reserved.
                            </div>
                            <div className="col-md-6 text-center text-md-end">
                                <div className="footer-menu">
                                    <Link to="/">Home</Link>
                                    <Link to="/contact">Contact</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Footer;
