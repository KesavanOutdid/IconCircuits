import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Carousel } from "react-bootstrap";
import hero1 from "../assets/img/Design_for_Innovation.png";
import hero2 from "../assets/img/prototype.png";
import hero3 from "../assets/img/PCB_design_assembly_service.png";
import hero4 from "../assets/img/mechanical_design_product_engineering.png";
import "../assets/css/Hero.css";
import Slider from "react-slick";

const Hero = () => {

    const slides = [
        {
            id: 1,
            title: "Design for Innovation",
            text: "We are a next-generation PCB design company driven by innovation and precision. Our team specializes in Multilayer, High-Density, and High-Complexity PCB Layout Design for products that demand reliability, performance, and manufacturability.",
            image: hero1,
        },
        {
            id: 2,
            title: "Prototype",
            text: "Quick turns, top quality! Get your designs manufactured in just 24 hours with 98% on-time delivery.",
            image: hero2,
        },
        {
            id: 3,
            title: "PCB assembly service",
            text: "As an elite PCB design and assembly service, we combine speed, precision, and affordability. Our fully automated facilities and streamlined processes guarantee quick delivery, uncompromised quality, and cost-effective manufacturing for every project.",
            image: hero3,
        },
        {
            id: 4,
            title: "Mechanical design & product engineering",
            text: "We specialize in mechanical design and product engineering — turning ideas into high-quality, manufacturable products with precision and efficiency.",
            image: hero4,
        },
    ];

    // const testimonials = [
    //     {
    //         img: "img/testimonial-1.jpg",
    //         name: "Client Name",
    //         profession: "Profession",
    //         text: "Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet",
    //     },
    //     {
    //         img: "img/testimonial-2.jpg",
    //         name: "Client Name",
    //         profession: "Profession",
    //         text: "Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet",
    //     },
    //     {
    //         img: "img/testimonial-3.jpg",
    //         name: "Client Name",
    //         profession: "Profession",
    //         text: "Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet",
    //     },
    // ];

    // const settings = {
    //     dots: true,
    //     infinite: true,
    //     speed: 500,
    //     slidesToShow: 1,
    //     slidesToScroll: 1,
    //     autoplay: true,
    //     autoplaySpeed: 5000,
    // };

    return (
        <div>
            <Navbar />

            {/* Hero Start */}
            <div className="container-fluid p-0">
                <Carousel
                    id="heroCarousel"
                    className="carousel slide"
                    data-bs-ride="carousel"
                    data-bs-interval="10000"
                >
                    {slides.map((slide) => (
                        <Carousel.Item key={slide.id}>
                            <div
                                className="container-fluid pt-5 bg-primary hero-header"
                                style={{
                                    paddingTop: "3rem",
                                    backgroundColor: "#0d6efd",
                                    color: "#fff",
                                }}
                            >
                                <div
                                    className="container pt-2"
                                    style={{
                                        paddingTop: "1rem",
                                        maxWidth: "1200px",
                                        margin: "0 auto",
                                    }}
                                >
                                    <div
                                        className="row g-5"
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "1.5rem",
                                            textAlign: "center",
                                        }}
                                    >
                                        {/* Left Section */}
                                        <div
                                            className="col-lg-6 align-self-center"
                                            style={{
                                                flex: "1 1 100%",
                                                maxWidth: "550px",
                                            }}
                                        >
                                            <div
                                                className="rounded-pill text-white px-3 mb-3 animated slideInRight"
                                                style={{
                                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                                    display: "inline-block",
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "50rem",
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                Icon Circuits
                                            </div>

                                            <h1
                                                className="display-4 text-white animated slideInRight"
                                                style={{
                                                    fontSize: "clamp(1.8rem, 4vw, 3rem)",
                                                    fontWeight: "700",
                                                    lineHeight: "1.2",
                                                    marginBottom: "1rem",
                                                }}
                                            >
                                                {slide.title}
                                            </h1>

                                            <p
                                                className="text-white mb-4 animated slideInRight"
                                                style={{
                                                    fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                                                    marginBottom: "1.5rem",
                                                }}
                                            >
                                                {slide.text}
                                            </p>

                                            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                                                <Link
                                                    to="#"
                                                    className="btn btn-light py-sm-3 px-sm-5 rounded-pill me-3 animated slideInRight"
                                                    style={{
                                                        padding: "0.7rem 1.5rem",
                                                        borderRadius: "50rem",
                                                        fontWeight: "600",
                                                        textDecoration: "none",
                                                        color: "#0d6efd",
                                                    }}
                                                >
                                                    Read More
                                                </Link>

                                                <Link
                                                    to="/contact"
                                                    className="btn btn-outline-light py-sm-3 px-sm-5 rounded-pill animated slideInRight"
                                                    style={{
                                                        padding: "0.7rem 1.5rem",
                                                        borderRadius: "50rem",
                                                        fontWeight: "600",
                                                        textDecoration: "none",
                                                        border: "2px solid white",
                                                        color: "white",
                                                    }}
                                                >
                                                    Contact Us
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Right Section */}
                                        <div
                                            className="col-lg-6 align-self-end"
                                            style={{
                                                flex: "1 1 100%",
                                                maxWidth: "600px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <img
                                                className="hero-img"
                                                src={slide.image}
                                                alt={slide.title}
                                                style={{
                                                    width: "100%",
                                                    maxWidth: "600px",
                                                    height: "auto",
                                                    maxHeight: "350px",
                                                    objectFit: "cover",
                                                    borderRadius: "10px",
                                                    border: "3px solid white",
                                                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>

            {/* Hero end */}

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

            {/* About Start */}
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <div className="about-img">
                                <img className="img-fluid" alt="img" src="img/Low-power-circuit-design-involves-a-variety-of-techniques-in-minimizing-power-loss_pwj1ma.avif" />
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            {/* <div className="btn btn-sm border rounded-pill text-primary px-3 mb-3">About Us</div> */}
                            <h1>Tool Expertise</h1>
                            <div className="pcb-line mb-4">
                                <span className="resistor mt-40"></span>
                            </div>
                            <p className="mb-2">We provide complete PCB design support ranging from two-layer to complex multilayer boards, backed by a dedicated quality engineering team to ensure precision and reliability at every stage.</p>
                            <p className="mb-4">Proficiency across leading EDA tools, including Cadence (Allegro, OrCAD), Mentor (Pads, Expedition, DX Designer), Altium and Eagle.</p>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check text-secondary me-2"></i>Expert PCB Solutions</h6>
                                    <h6 className="mb-0"><i className="fa fa-check text-secondary me-2"></i>Mastery in EDA Tools</h6>
                                </div>
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check text-secondary me-2"></i>Precision & Performance</h6>
                                    <h6 className="mb-0"><i className="fa fa-check text-secondary me-2"></i>Trusted Support, Fair Pricing</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* About end */}

            {/* Service Start */}
            <div className="container-fluid bg-light mt-5 py-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                        {/* Left Text Section */}
                        <div className="col-lg-5 wow fadeIn" data-wow-delay="0.1s">
                            <h1>Your One-Stop Solution!</h1>
                            <div className="pcb-line mb-4">
                                <span className="resistor mt-40"></span>
                            </div>
                            <p className="mb-2">✔️ End-to-end PCB fabrication with precision and quality.</p>
                            <p className="mb-2">✔️ Reliable PCB assembly for any volume or complexity.</p>
                            <p className="mb-4">✔️ Fast and verified component sourcing for your projects.</p>
                            <Link className="btn btn-primary rounded-pill px-4" to="">Read More</Link>
                        </div>

                        {/* Services Cards */}
                        <div className="col-lg-7">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="row g-4">
                                        {/* Fabrication */}
                                        <div className="col-12 wow fadeIn" data-wow-delay="0.1s">
                                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                                <div className="service-icon btn-square">
                                                    <i className="fa fa-microchip fa-2x"></i>
                                                </div>
                                                <h5 className="mb-3">Design</h5>
                                                <p>High-precision PCB fabrication from 2 to 16 layers, ensuring performance and reliability.</p>
                                                <Link className="btn px-3 mt-auto mx-auto" to="">Read More</Link>
                                            </div>
                                        </div>

                                        <div className="col-12 wow fadeIn" data-wow-delay="0.5s">
                                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                                <div className="service-icon btn-square">
                                                    <i className="fa fa-tools fa-2x"></i>
                                                </div>
                                                <h5 className="mb-3">Assembly</h5>
                                                <p>Automated SMT and Through-Hole PCB assembly with quality inspection and BGA support.</p>
                                                <Link className="btn px-3 mt-auto mx-auto" to="">Read More</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 pt-md-4">
                                    <div className="row g-4">
                                        <div className="col-12 wow fadeIn" data-wow-delay="0.3s">
                                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                                <div className="service-icon btn-square">
                                                    <i className="fa fa-robot fa-2x"></i>
                                                </div>
                                                <h5 className="mb-3">Fabrication</h5>
                                                <p>High-precision PCB fabrication from 2 to 16 layers, ensuring performance and reliability.</p>
                                                <Link className="btn px-3 mt-auto mx-auto" to="">Read More</Link>
                                            </div>
                                        </div>

                                        <div className="col-12 wow fadeIn" data-wow-delay="0.7s">
                                            <div className="service-item d-flex flex-column justify-content-center text-center rounded">
                                                <div className="service-icon btn-square">
                                                    <i className="fa fa-cogs fa-2x"></i>
                                                </div>
                                                <h5 className="mb-3">Mechanical Design & Product Engineering</h5>
                                                <p>Transforming concepts into manufacturable products through 3D design, simulation, and rapid prototyping.</p>
                                                <Link className="btn px-3 mt-auto mx-auto" to="">Read More</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Service End */}

            {/* Feature Start */}
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
            {/* Feature End */}

            {/* Empower Start */}
            <div className="container-fluid bg-light py-5">
                <div className="container py-5">
                    <div className="mx-auto text-center wow fadeIn" data-wow-delay="0.1s" style={{ maxWidth: "500px" }}>
                        <div className="btn btn-sm border rounded-pill text-primary px-3 mb-3">Empower</div>
                        <h2 className="mb-4">Passion to Empower Innovators</h2>
                        <div style={{ paddingLeft: '40%' }}>
                            <div className="pcb-line mb-4">
                                <span className="resistor mt-40"></span>
                            </div>
                        </div>
                        <p>We know innovation happens at all scales. That is why we work with
                            companies, researchers, students and hobbyists.</p>
                    </div>
                    <div className="row g-3">
                        <div className="col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                            <div className="case-item position-relative overflow-hidden rounded mb-2">
                                <img className="img-fluid" src="img/ic-project1.jpg" alt="img" style={{
                                    height: "250px",
                                    width: "100%",
                                    objectFit: "cover",
                                    border: "3px solid #fcb535",
                                    borderRadius: "10px"
                                }} />
                                <Link className="case-overlay text-decoration-none" to="">
                                    <small>Customer</small>
                                    <h5 className="lh-base text-white mb-3">Customer Centricity</h5>
                                    {/* <span className="btn btn-square btn-primary"><i className="fa fa-arrow-right"></i></span> */}
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                            <div className="case-item position-relative overflow-hidden rounded mb-2">
                                <img className="img-fluid" src="img/ic-project2.jpg" alt="img" style={{
                                    height: "250px",
                                    width: "100%",
                                    objectFit: "cover",
                                    border: "3px solid #fcb535",
                                    borderRadius: "10px"
                                }} />
                                <Link className="case-overlay text-decoration-none" to="">
                                    <small>Dynamic Solutions</small>
                                    <h5 className="lh-base text-white mb-3">Aim to Provide Dynamic Solutions of Standardized Quality</h5>
                                    {/* <span className="btn btn-square btn-primary"><i className="fa fa-arrow-right"></i></span> */}
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-3 wow fadeIn" data-wow-delay="0.7s">
                            <div className="case-item position-relative overflow-hidden rounded mb-2">
                                <img className="img-fluid" src="img/ic-project3.jpeg" alt="" style={{
                                    height: "250px",
                                    width: "100%",
                                    objectFit: "cover",
                                    border: "3px solid #fcb535",
                                    borderRadius: "10px"
                                }} />
                                <Link className="case-overlay text-decoration-none" to="">
                                    <small>Innovators</small>
                                    <h5 className="lh-base text-white mb-3">Passion to Empower Innovators</h5>
                                    {/* <span className="btn btn-square btn-primary"><i className="fa fa-arrow-right"></i></span> */}
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-3 wow fadeIn" data-wow-delay="0.7s">
                            <div className="case-item position-relative overflow-hidden rounded mb-2">
                                <img className="img-fluid" src="img/ic-project4.jpg" alt="" style={{
                                    height: "250px",
                                    width: "100%",
                                    objectFit: "cover",
                                    border: "3px solid #fcb535",
                                    borderRadius: "10px"
                                }} />
                                <Link className="case-overlay text-decoration-none" to="">
                                    <small>Growth</small>
                                    <h5 className="lh-base text-white mb-3">Growth Catalysts – Our People</h5>
                                    {/* <span className="btn btn-square btn-primary"><i className="fa fa-arrow-right"></i></span> */}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Empower End */}

            {/* FAQs Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="mx-auto text-center wow fadeIn" data-wow-delay="0.1s" style={{ maxWidth: "500px" }}>
                        <div className="btn btn-sm border rounded-pill text-primary px-3 mb-3">Popular FAQs</div>
                        <h2 className="mb-4">Frequently Asked Questions</h2>
                        <div style={{ paddingLeft: '40%' }}>
                            <div className="pcb-line mb-4">
                                <span className="resistor mt-40"></span>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="accordion" id="accordionFAQ1">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingOne">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                            What does Icon Circuits do?
                                        </button>
                                    </h2>
                                    <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne"
                                        data-bs-parent="#accordionFAQ1">
                                        <div className="accordion-body">
                                            We specialize in high-quality PCB design, fabrication, and assembly for startups, engineers, and businesses of all sizes.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingTwo">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                            What is PCB assembly and do you offer it?
                                        </button>
                                    </h2>
                                    <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo"
                                        data-bs-parent="#accordionFAQ1">
                                        <div className="accordion-body">
                                            Yes, we handle the entire PCB assembly process — from placing components to testing the final product.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingThree">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                            How do I place an order?
                                        </button>
                                    </h2>
                                    <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree"
                                        data-bs-parent="#accordionFAQ1">
                                        <div className="accordion-body">
                                            Simply reach out via our contact form or email us with your requirements. We'll guide you through the rest.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingFour">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                                            How long does shipping and delivery take?
                                        </button>
                                    </h2>
                                    <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour"
                                        data-bs-parent="#accordionFAQ1">
                                        <div className="accordion-body">
                                            Turnaround times vary by project complexity, but we always strive for quick and reliable delivery — often within days.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="accordion" id="accordionFAQ2">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingFive">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                                            Do you provide PCB fabrication services?
                                        </button>
                                    </h2>
                                    <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive"
                                        data-bs-parent="#accordionFAQ2">
                                        <div className="accordion-body">
                                            Absolutely! We offer precise and affordable PCB fabrication with various material and layer options.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingSix">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                                            Can you help with component sourcing?
                                        </button>
                                    </h2>
                                    <div id="collapseSix" className="accordion-collapse collapse" aria-labelledby="headingSix"
                                        data-bs-parent="#accordionFAQ2">
                                        <div className="accordion-body">
                                            Yes, we can source components globally or use parts you provide. We focus on quality, availability, and cost-effectiveness.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingSeven">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseSeven" aria-expanded="false" aria-controls="collapseSeven">
                                            How do you handle pricing and payments?
                                        </button>
                                    </h2>
                                    <div id="collapseSeven" className="accordion-collapse collapse" aria-labelledby="headingSeven"
                                        data-bs-parent="#accordionFAQ2">
                                        <div className="accordion-body">
                                            We provide upfront, transparent quotes. Payment can be made via bank transfer, UPI, or other secure methods.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingEight">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseEight" aria-expanded="false" aria-controls="collapseEight">
                                            I'm on a strict budget. Can you still help?
                                        </button>
                                    </h2>
                                    <div id="collapseEight" className="accordion-collapse collapse" aria-labelledby="headingEight"
                                        data-bs-parent="#accordionFAQ2">
                                        <div className="accordion-body">
                                            Definitely. We offer budget-friendly options without compromising on quality. Let us know your needs and we’ll tailor a solution.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* FAQs Start */}

            {/* Testimonial Start */}
            {/* <div className="container-xxl py-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-lg-5">
                            <div className="btn btn-sm border rounded-pill text-primary px-3 mb-3">
                                Testimonial
                            </div>
                            <h1 className="mb-4">What Say Our Clients!</h1>
                            <p className="mb-4">
                                Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit.
                                Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit.
                            </p>
                            <Link className="btn btn-primary rounded-pill px-4" to="/">
                                Read More
                            </Link>
                        </div>

                        <div className="col-lg-7">
                            <Slider {...settings}>
                                {testimonials.map((item, index) => (
                                    <div key={index} className="testimonial-item ps-5 border-start border-primary">
                                        <i className="fa fa-quote-left fa-2x text-primary mb-3"></i>
                                        <p className="fs-4">{item.text}</p>
                                        <div className="d-flex align-items-center">
                                            <img
                                                className="img-fluid flex-shrink-0 rounded-circle"
                                                src={item.img}
                                                alt={item.name}
                                                style={{ width: "60px", height: "60px" }}
                                            />
                                            <div className="ps-3">
                                                <h5 className="mb-1">{item.name}</h5>
                                                <span>{item.profession}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>
            </div> */}
            {/* Testimonial End */}

            <Footer />
        </div>
    );
};

export default Hero;
