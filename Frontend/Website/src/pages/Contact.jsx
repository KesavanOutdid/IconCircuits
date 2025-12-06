import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const Contact = () => {
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });


    // Handle Contact Form Input Change
    const handleContactChange = (e) => {
        setContactForm({ ...contactForm, [e.target.id]: e.target.value });
    };

    // Submit Contact Form
    const handleContactSubmit = async (e) => {
        e.preventDefault();
        try {
            // Replace with your API endpoint
            await axios.post('/api/contact', contactForm);

            Swal.fire({
                icon: 'success',
                title: 'Message Sent!',
                text: 'Thank you for contacting us. We will get back to you soon.',
                confirmButtonText: 'OK'
            });

            // Reset form
            setContactForm({ name: '', email: '', subject: '', message: '' });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again later.',
            });
        }
    };



    return (
        <div>
            <Navbar />

            {/* Hero Start */}
            <div className="container-fluid pt-5 bg-primary hero-header" style={{ height: '25vh' }}>
                <div className="container pt-5">
                    <div className="row g-5 pt-5">
                        <div className="col-lg-12 text-center mb-lg-5">
                            <h1 className="display-4 text-white mb-4 animated slideInRight">Contact Us</h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <li className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></li>
                                    <li className="breadcrumb-item text-white active" aria-current="page">Contact Us</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hero End */}

            {/* Contact Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="mx-auto text-center" style={{ maxWidth: "500px" }}>
                        <h1 className="mb-4">If You Have Any Query, Please Contact Us</h1>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <p className="text-center mb-4">For registration questions please get in touch using the contact details below. For any questions use the form.</p>
                            <div>
                                <form onSubmit={handleContactSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input type="text" className="form-control" id="name" placeholder="Your Name" value={contactForm.name} onChange={handleContactChange} required />
                                                <label htmlFor="name">Your Name</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input type="email" className="form-control" id="email" placeholder="Your Email" value={contactForm.email} onChange={handleContactChange} required />
                                                <label htmlFor="email">Your Email</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating">
                                                <input type="text" className="form-control" id="subject" placeholder="Subject" value={contactForm.subject} onChange={handleContactChange} required />
                                                <label htmlFor="subject">Subject</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating">
                                                <textarea className="form-control" placeholder="Leave a message here" id="message" style={{ height: "150px" }} value={contactForm.message} onChange={handleContactChange} required></textarea>
                                                <label htmlFor="message">Message</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <button className="btn btn-primary w-100 py-3" type="submit">Send Message</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Contact End */}

            {/* Full Screen Search Start */}
            <div className="modal fade" id="searchModal" tabIndex="-1">
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content" style={{ background: " rgba(20, 24, 62, 0.7)" }}>
                        <div className="modal-header border-0">
                            <button type="button" className="btn btn-square bg-white btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex align-items-center justify-content-center">
                            <div className="input-group" style={{ maxWidth: "600px" }}>
                                <input type="text" className="form-control bg-transparent border-light p-3"
                                    placeholder="Type search keyword" style={{ color: 'white' }} />
                                <button className="btn btn-light px-4"><i className="bi bi-search"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Full Screen Search end */}

            <Footer />
        </div>
    );
};

export default Contact;
