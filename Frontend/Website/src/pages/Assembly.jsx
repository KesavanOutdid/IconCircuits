import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Assembly = () => {
    return (
        <div>
            <Navbar />

            {/* Hero Start */}
            <div className="container-fluid bg-primary hero-header" style={{ height: '15vh' }}>
                <div className="container pt-4">
                    <div className="row g-5 pt-5">
                        <div className="col-lg-12 text-center">
                            {/* <h1 className="display-4 text-white mb-4 animated slideInRight">Assembly Services</h1> */}
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <h5 className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></h5>
                                    <h5 className="breadcrumb-item text-white active" aria-current="page">Assembly</h5>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hero End */}

            {/* Assembly Content Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <div className="about-img">
                                <img className="img-fluid" src="/img/pcb-layout.jpg" alt='Assembly Services' />
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <div className="btn btn-sm border rounded-pill text-primary px-3 mb-3">Assembly</div>
                            <h1 className="mb-4">Automated PCB Assembly & Manufacturing</h1>

                            <div className="pcb-line mb-4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <span className="resistor mt-40" style={{ display: "block" }}></span>
                            </div>

                            <p className="mb-4">
                                Our state-of-the-art PCB assembly services combine automated SMT (Surface Mount Technology) and through-hole assembly with rigorous quality control. We handle projects of any size, from prototypes to high-volume production runs.
                            </p>
                            <p className="mb-4">
                                With BGA support, 0201 component placement capability, and comprehensive testing protocols, we ensure your boards meet the highest standards of reliability and performance.
                            </p>

                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <h6 className="mb-3">
                                        <i className="fa fa-check text-secondary me-2"></i>SMT Assembly
                                    </h6>
                                    <h6 className="mb-0">
                                        <i className="fa fa-check text-secondary me-2"></i>BGA Support
                                    </h6>
                                </div>
                                <div className="col-sm-6">
                                    <h6 className="mb-3">
                                        <i className="fa fa-check text-secondary me-2"></i>Through-Hole Assembly
                                    </h6>
                                    <h6 className="mb-0">
                                        <i className="fa fa-check text-secondary me-2"></i>Quality Testing
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Assembly Content End */}

            {/* Features Start */}
            <div className="container-fluid bg-light py-5">
                <div className="container py-5">
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.1s">
                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                <div className="service-icon btn-square">
                                    <i className="fa fa-robot fa-2x"></i>
                                </div>
                                <h5 className="mb-3">Automated Assembly</h5>
                                <p>Precision automated placement for consistent, high-quality results.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                <div className="service-icon btn-square">
                                    <i className="fa fa-check-circle fa-2x"></i>
                                </div>
                                <h5 className="mb-3">Quality Assurance</h5>
                                <p>Comprehensive testing and inspection at every stage.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                <div className="service-icon btn-square">
                                    <i className="fa fa-shipping-fast fa-2x"></i>
                                </div>
                                <h5 className="mb-3">Fast Turnaround</h5>
                                <p>Quick delivery without compromising on quality.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.7s">
                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                <div className="service-icon btn-square">
                                    <i className="fa fa-cogs fa-2x"></i>
                                </div>
                                <h5 className="mb-3">Flexible Solutions</h5>
                                <p>Support for prototypes, small batch, and mass production.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Features End */}

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

export default Assembly;
