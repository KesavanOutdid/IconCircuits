import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const MechanicalDesign = () => {
    return (
        <div>
            <Navbar />

            {/* Hero Start */}
            <div className="container-fluid bg-primary hero-header" style={{ height: '15vh' }}>
                <div className="container pt-4">
                    <div className="row g-5 pt-5">
                        <div className="col-lg-12 text-center">
                            {/* <h1 className="display-4 text-white mb-4 animated slideInRight">Mechanical Design & Product Engineering</h1> */}
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <h5 className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></h5>
                                    <h5 className="breadcrumb-item text-white active" aria-current="page">Mechanical Design</h5>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hero End */}

            {/* Mechanical Design Content Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <div className="about-img">
                                <img className="img-fluid" src="/img/pcb-layout.jpg" alt='Mechanical Design' />
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <div className="btn btn-sm border rounded-pill text-primary px-3 mb-3">Mechanical Design</div>
                            <h1 className="mb-4">Transform Ideas into Manufacturable Products</h1>

                            <div className="pcb-line mb-4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <span className="resistor mt-40" style={{ display: "block" }}></span>
                            </div>

                            <p className="mb-4">
                                Our mechanical design and product engineering team combines creativity with practical manufacturing expertise. We transform your concepts into detailed, production-ready designs that balance functionality, aesthetics, and cost-effectiveness.
                            </p>
                            <p className="mb-4">
                                From 3D CAD modeling to FEA simulations and rapid prototyping, we ensure every design is optimized for manufacturability and performance.
                            </p>

                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <h6 className="mb-3">
                                        <i className="fa fa-check text-secondary me-2"></i>3D CAD Design
                                    </h6>
                                    <h6 className="mb-0">
                                        <i className="fa fa-check text-secondary me-2"></i>FEA Simulation
                                    </h6>
                                </div>
                                <div className="col-sm-6">
                                    <h6 className="mb-3">
                                        <i className="fa fa-check text-secondary me-2"></i>Rapid Prototyping
                                    </h6>
                                    <h6 className="mb-0">
                                        <i className="fa fa-check text-secondary me-2"></i>Manufacturing Support
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mechanical Design Content End */}

            {/* Design Services Start */}
            <div className="container-fluid bg-light py-5">
                <div className="container py-5">
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.1s">
                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                <div className="service-icon btn-square">
                                    <i className="fa fa-cube fa-2x"></i>
                                </div>
                                <h5 className="mb-3">3D Modeling</h5>
                                <p>Professional CAD design in SolidWorks, AutoCAD, and Fusion 360.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                <div className="service-icon btn-square">
                                    <i className="fa fa-calculator fa-2x"></i>
                                </div>
                                <h5 className="mb-3">Simulations</h5>
                                <p>Structural analysis and thermal simulations for optimal performance.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                <div className="service-icon btn-square">
                                    <i className="fa fa-print fa-2x"></i>
                                </div>
                                <h5 className="mb-3">Rapid Prototyping</h5>
                                <p>3D printing and CNC machining for quick prototypes.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.7s">
                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                <div className="service-icon btn-square">
                                    <i className="fa fa-industry fa-2x"></i>
                                </div>
                                <h5 className="mb-3">Manufacturing</h5>
                                <p>Design for manufacturability (DFM) guidance and production support.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Design Services End */}

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

export default MechanicalDesign;
