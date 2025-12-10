import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import Slider from "react-slick";

const About = () => {

    return (
        <div>
            <Navbar />

            {/*Hero Start */}
            <div className="container-fluid bg-primary hero-header" style={{ height: '15vh' }}>
                <div className="container pt-4">
                    <div className="row g-5 pt-5">
                        <div className="col-lg-12 text-center">
                            {/* <h1 className="display-4 text-white mb-4 animated slideInRight">About Us</h1> */}
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <h5 className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></h5>
                                    <h5 className="breadcrumb-item text-white active" aria-current="page">About Us</h5>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/*Hero End */}


            {/*Full Screen Search Start */}
            <div className="modal fade" id="searchModal" tabIndex="-1">
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content" style={{ background: "rgba(20, 24, 62, 0.7)" }}>
                        <div className="modal-header border-0">
                            <button type="button" className="btn btn-square bg-white btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex align-items-center justify-content-center">
                            <div className="input-group" style={{ maxWidth: "600px" }}>
                                <input type="text" className="form-control bg-transparent border-light p-3"
                                    placeholder="Type search keyword" />
                                <button className="btn btn-light px-4"><i className="bi bi-search"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Full Screen Search End */}

            {/*About Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <div className="about-img">
                                <img className="img-fluid" src="/img/about-img.jpg" alt='img' />
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <div className="btn btn-sm border rounded-pill text-primary px-3 mb-3">About Us</div>
                            <h1 className="mb-4">We Empower Innovation with Intelligent PCB Solutions</h1>

                            <div className="pcb-line mb-4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <span className="resistor mt-40" style={{ display: "block" }}></span>
                            </div>

                            <p className="mb-4">
                                Founded with a vision to bring global manufacturing and engineering standards to India, Icon Circuits is
                                redefining how PCB design and fabrication serve today’s electronics innovators. From startups and students
                                to large enterprises, our design-first approach fuels faster development, cleaner execution, and scalable solutions.
                            </p>
                            <p className="mb-4">
                                Over the years, we've evolved into a customer-centric, innovation-led, and reliability-focused team—empowering
                                every creator with smarter, agile, and high-quality PCB services.
                            </p>

                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <h6 className="mb-3">
                                        <i className="fa fa-check text-secondary me-2"></i>Design-Led Thinking
                                    </h6>
                                    <h6 className="mb-0">
                                        <i className="fa fa-check text-secondary me-2"></i>Reliable Delivery
                                    </h6>
                                </div>
                                <div className="col-sm-6">
                                    <h6 className="mb-3">
                                        <i className="fa fa-check text-secondary me-2"></i>Startup-Friendly Pricing
                                    </h6>
                                    <h6 className="mb-0">
                                        <i className="fa fa-check text-secondary me-2"></i>Dedicated Support
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*About End */}

            {/*Feature Start */}
            <div className="container-fluid bg-primary feature pt-5">
                <div className="container pt-5">
                    <div className="row g-5">

                        {/* Left Side */}
                        <div
                            className="col-lg-6 align-self-center mb-md-5 pb-md-5 wow fadeIn"
                            data-wow-delay="0.3s"
                        >
                            <div
                                style={{
                                    display: "inline-block",
                                    border: "1px solid white",
                                    borderRadius: "999px",
                                    padding: "5px 15px",
                                    color: "white",
                                    marginBottom: "20px",
                                    fontSize: "14px",
                                }}
                            >
                                Why Choose Us
                            </div>

                            <h1 style={{ color: "white", marginBottom: "20px" }}>
                                Why Choose IconCircuits for PCB Design Services?
                            </h1>

                            <p style={{ color: "#dcdcdc", marginBottom: "20px" }}>
                                We deliver customized PCB solutions with <strong>exceptional quality, transparency, and reliability</strong>, ensuring a fast turnaround and support for a wide variety of specifications.
                            </p>

                            {/* Features */}
                            {[
                                {
                                    title: "Transparency",
                                    description: "Clear pricing and communication at every stage.",
                                },
                                {
                                    title: "Reliability",
                                    description: "Consistent performance with adherence to quality standards.",
                                },
                                {
                                    title: "Timely Delivery",
                                    description: "Fast and efficient project completion.",
                                },
                                {
                                    title: "Traceability",
                                    description: "End-to-end quality control and quick issue resolution.",
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "start",
                                        color: "white",
                                        marginBottom: "16px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            backgroundColor: "white",
                                            color: "#0d6efd",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: "10px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        ✓
                                    </div>
                                    <span>
                                        <strong>{item.title}:</strong> {item.description}
                                    </span>
                                </div>
                            ))}

                            {/* Stats */}
                            <div className="row g-4 pt-3">
                                <div className="col-sm-6">
                                    <div
                                        style={{
                                            display: "flex",
                                            backgroundColor: "rgba(255,255,255,0.1)",
                                            padding: "15px",
                                            borderRadius: "8px",
                                            alignItems: "center",
                                        }}
                                    >
                                        <i className="fa fa-users fa-3x text-white"></i>
                                        <div style={{ marginLeft: "15px" }}>
                                            <h2 style={{ color: "white", marginBottom: "0" }}>99+</h2>
                                            <p style={{ color: "white", marginBottom: "0" }}>
                                                Happy Clients
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div
                                        style={{
                                            display: "flex",
                                            backgroundColor: "rgba(255,255,255,0.1)",
                                            padding: "15px",
                                            borderRadius: "8px",
                                            alignItems: "center",
                                        }}
                                    >
                                        <i className="fa fa-check fa-3x text-white"></i>
                                        <div style={{ marginLeft: "15px" }}>
                                            <h2 style={{ color: "white", marginBottom: "0" }}>99+</h2>
                                            <p style={{ color: "white", marginBottom: "0" }}>
                                                Projects Completed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Image Slider */}
                        <div
                            className="col-lg-6 d-flex justify-content-center align-items-center wow fadeIn"
                            data-wow-delay="0.5s"
                            style={{ minHeight: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                            <div style={{ width: "100%", padding: "5px" }}>
                                <Slider
                                    dots={false}
                                    infinite={true}
                                    speed={500}
                                    slidesToShow={1}
                                    slidesToScroll={1}
                                    autoplay={true}
                                    autoplaySpeed={2000}
                                    centerMode={true}
                                    centerPadding="100px"
                                >
                                    {["pcb1.png", "pcb2.jpg", "pcb3.jpg", "pcb4.jpg"].map((img, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                padding: "5px",
                                            }}
                                        >
                                            <img
                                                src={`img/${img}`}
                                                alt={`PCB ${index + 1}`}
                                                style={{
                                                    width: "400px",
                                                    height: "300px",
                                                    borderRadius: "20px",
                                                    border: "2px solid white",
                                                    objectFit: "cover",
                                                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Feature End */}


            {/*PCB Power's Start */}
            <div className="container-fluid bg-light mt-5 py-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-12 wow fadeIn" data-wow-delay="0.1s">
                            <h1>PCB Power's</h1>
                            <p>Enabling Smarter, Faster Electronics with Icon Circuits</p>
                            <div
                                className="pcb-line mb-4"
                                style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                            >
                                <span className="resistor mt-40" style={{ display: "block" }}></span>
                            </div>
                            <p className="mb-2">
                                As a company, we are clear on our vision and mission, both of which revolve around you.
                                A company is built for providing solutions. A brand is built for promises.
                                An institution is built for excellence. We are a company, building a brand with an ambition to become an institution.
                                All institutions are built on principles that guide their modus operandi on how they connect with people both inside and outside their circle.
                                The PCB Power team operates on three key principles.
                            </p>
                        </div>

                        {/* Cards in same row */}
                        <div className="col-12">
                            <div className="row g-4">
                                {/* Vision */}
                                <div className="col-md-4 wow fadeIn" data-wow-delay="0.1s">
                                    <div className="service-item d-flex flex-column justify-content-center text-center rounded h-100">
                                        <div className="service-icon btn-square">
                                            <i className="fa fa-microchip fa-2x"></i>
                                        </div>
                                        <h5 className="mb-3">Vision</h5>
                                        <p>To become the integrated electronics, design and manufacturing partner of all innovative electronics manufacturing companies.</p>
                                    </div>
                                </div>

                                {/* Mission */}
                                <div className="col-md-4 wow fadeIn" data-wow-delay="0.2s">
                                    <div className="service-item d-flex flex-column justify-content-center text-center rounded h-100">
                                        <div className="service-icon btn-square">
                                            <i className="fa fa-rocket fa-2x"></i>
                                        </div>
                                        <h5 className="mb-3">Mission</h5>
                                        <p>To empower innovators in the electronics industry by becoming the foundation of their products and services.</p>
                                    </div>
                                </div>

                                {/* Principles */}
                                <div className="col-md-4 wow fadeIn" data-wow-delay="0.3s">
                                    <div className="service-item d-flex flex-column justify-content-center text-center rounded h-100">
                                        <div className="service-icon btn-square">
                                            <i className="fa fa-balance-scale fa-2x"></i>
                                        </div>
                                        <h5 className="mb-3">Principles</h5>
                                        <p>
                                            ✔️ Customer at the Centre of Everything.<br />
                                            ✔️ Ethics, Transparency and Honesty in All Our Dealings.<br />
                                            ✔️ Excellence Driven Action Over Everything Else.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*PCB Power's End */}

            <Footer />
        </div>
    );
};

export default About;
