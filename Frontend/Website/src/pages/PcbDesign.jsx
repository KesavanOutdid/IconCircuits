import React, { useState } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import "../assets/css/PCBdesign.css";

const PcbDesign = () => {
    const features = [
        {
            id: 1,
            title: "1. Hardware Design",
            description:
                "We provide full-cycle design and engineering support from concept to production. We have extensive experience in Power Management & Energy Efficiency, Wireless & IoT Solutions, and Custom Electronics for Specialized Applications. We can provide fast delivery solutions.",
            img: "img/pcb-layout.jpg",
            controls: true,
        },
        {
            id: 2,
            title: "2. Software Development",
            description:
                "Providing a comprehensive solution from low-level drivers to application-layer logic, ensuring your hardware devices operate efficiently and stably. Our team has extensive experience in embedded system development and can develop custom firmware for MCUs (STM32, ESP32, Nordic, NXP, etc.) and SoC platforms.",
            img: "img/pcb-layout.jpg",
        },
        {
            id: 3,
            title: "3. Manufacturing & Certification",
            description:
                "We are also a manufacturer of PCB, assembly, and 3D/CNC machining, helping you maximize cost control. Additionally, we assist with product certification, including FCC, CE, and more.",
            img: "img/pcb-layout.jpg",
        },
    ];

    // Define hook at top level (outside of any function)
    const [activeIndex, setActiveIndex] = useState(0);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    };

    const feature = features[activeIndex];

    return (
        <div>
            <Navbar />

            {/*Hero Start */}
            <div className="container-fluid pt-5 bg-primary hero-header" style={{ height: '25vh' }}>
                <div className="container pt-5">
                    <div className="row g-5 pt-5">
                        <div className="col-lg-12 text-center mb-lg-5">
                            <h1 className="display-4 text-white mb-4 animated slideInRight">PCB Design</h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <li className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></li>
                                    <li className="breadcrumb-item text-white active" aria-current="page">PCB Design</li>
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
                                <img className="img-fluid" src="img/about-img.jpg" alt='img' />
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            {/* <div className="btn btn-sm border rounded-pill text-primary px-3 mb-3">About Us</div> */}
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

            {/*PCB Power's Start */}
            <div className="container-fluid bg-light mt-5 py-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-12 wow fadeIn" data-wow-delay="0.1s">
                            <h1>Turnkey Electronic Design Services</h1>
                            <p>Empowering you with end-to-end electronic, mechanical & enclosure design solutions</p>
                            <div
                                className="pcb-line mb-4"
                                style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                            >
                                <span className="resistor mt-40" style={{ display: "block" }}></span>
                            </div>
                        </div>

                        {/* Cards in same row */}
                        <div className="col-12">
                            <div className="row g-4">

                                {/* PCB Layout */}
                                <div className="col-md-4 wow fadeIn" data-wow-delay="0.1s">
                                    <div className="service-item d-flex flex-column justify-content-center text-center rounded h-100">
                                        <div className="service-icon-img mb-3">
                                            <img src="img/pcb-layout.jpg" alt="PCB Layout" />
                                        </div>
                                        <h5 className="mb-3">PCB Layout</h5>
                                        <p className="text-start">
                                            <i className="fa fa-check text-secondary me-2"></i> Support 100,000+ pins layout design<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Stack-up design<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Controlled Impedance<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Rigid, Flex, HDI, High-speed, Power PCB design<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Up to 64 Layers
                                        </p>
                                    </div>
                                </div>

                                {/* PCB Design */}
                                <div className="col-md-4 wow fadeIn" data-wow-delay="0.2s">
                                    <div className="service-item d-flex flex-column justify-content-center text-center rounded h-100">
                                        <div className="service-icon-img mb-3">
                                            <img src="img/pcb-design.jpg" alt="PCB Design" />
                                        </div>
                                        <h5 className="mb-3">PCB Design</h5>
                                        <p className="text-start">
                                            <i className="fa fa-check text-secondary me-2"></i> Electronic design, firmware development<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Professional engineer team<br />
                                            <i className="fa fa-check text-secondary me-2"></i> From concept to product development<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Exceptional cost control<br />
                                            <i className="fa fa-check text-secondary me-2"></i> End-to-end solutions from design to test
                                        </p>
                                    </div>
                                </div>

                                {/* Mechanical & Enclosure Design */}
                                <div className="col-md-4 wow fadeIn" data-wow-delay="0.3s">
                                    <div className="service-item d-flex flex-column justify-content-center text-center rounded h-100">
                                        <div className="service-icon-img mb-3">
                                            <img src="img/mechanical-design.jpg" alt="Mechanical Design" />
                                        </div>
                                        <h5 className="mb-3">Mechanical & Enclosure Design</h5>
                                        <p className="text-start">
                                            <i className="fa fa-check text-secondary me-2"></i> Professional mechanical design solutions<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Experienced engineering team<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Rapid design turnaround<br />
                                            <i className="fa fa-check text-secondary me-2"></i> End-to-End solutions<br />
                                            <i className="fa fa-check text-secondary me-2"></i> Comprehensive production support
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*PCB Power's End */}

            {/*Custom Engineering Solutions Section start*/}
            <div className="container my-5">
                <h2 className="text-center fw-bold">Custom Engineering Solutions</h2>
                <div style={{ paddingLeft: '45%' }}>
                    <div className="pcb-line mb-4">
                        <span className="resistor mt-40"></span>
                    </div>
                </div>

                <div
                    className="custom-engineering-section row align-items-center"
                    style={{
                        border: '2px solid #fcb535',
                        borderRadius: '10px',
                        padding: '1rem'
                    }}
                >
                    {/* Left Text (col-6) */}
                    <div className="col-md-6 custom-engineering-text text-start">
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>

                        <div className="feature-controls mt-3">
                            <button className="btn btn-outline-primary me-2" onClick={handlePrev}>
                                &#x25C0;
                            </button>
                            <button className="btn btn-outline-primary" onClick={handleNext}>
                                &#x25B6;
                            </button>
                        </div>
                    </div>

                    {/* Right Image (col-6) */}
                    <div className="col-md-6 custom-engineering-image text-end">
                        <img
                            src={feature.img}
                            alt={feature.title}
                            className="img-fluid rounded shadow"
                        />
                    </div>
                </div>
            </div>
            {/*Custom Engineering Solutions Section end*/}

            {/*ordering to design start */}
            <div className="container-fluid bg-light py-5 process-flow">

                <div className="container py-5 process-flow">
                    <h2 className="text-center">What is the process from ordering to design?</h2>
                    <div style={{ paddingLeft: '45%' }}>
                        <div className="pcb-line mb-4">
                            <span className="resistor mt-40"></span>
                        </div>
                    </div>
                    {/* Tabs Section */}
                    <ul className="nav nav-tabs justify-content-center mb-4" id="pcbTabs" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="layout-tab" data-bs-toggle="tab" data-bs-target="#layout" type="button" role="tab">PCB Layout</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link" id="design-tab" data-bs-toggle="tab" data-bs-target="#design" type="button" role="tab">PCB Design</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link" id="mech-tab" data-bs-toggle="tab" data-bs-target="#mech" type="button" role="tab">Mechanical/Enclosure Design</button>
                        </li>
                    </ul>

                    <div className="tab-content" id="pcbTabsContent">

                        {/* TAB 1: PCB Layout */}
                        <div className="tab-pane fade show active" id="layout" role="tabpanel">
                            <div className="row g-4 align-items-center">
                                {/* LEFT: Image */}
                                <div className="col-md-7 text-center">
                                    <div className="process-image-wrapper">
                                        <img src="img/flow-layout.png" alt="PCB Layout Process" className="img-fluid process-image" />
                                    </div>
                                </div>

                                {/* RIGHT: Text */}
                                <div className="col-md-5">
                                    <div className="process-side">
                                        <h5>PCB Layout Precautions</h5>
                                        <p><strong>Customers need to provide:</strong><br />Schematic, netlist, structure file, component information for new library, impedance control and high current design requirements, etc.</p>
                                        <p><strong>PCBWay reviews placement, routing, gerber file:</strong><br />According to PCBWay design specifications, design instructions, customer design requirements and related checklists.</p>
                                        <p><strong>Customer reviews placement, routing, gerber file:</strong><br />PCBWay provides placement and routing files for customers to review. Customers need to finally confirm the rationality of the layout, stack-up and impedance control.</p>
                                        <p><strong>Design Data Output:</strong><br />PCB layout source files, Gerber files, assembly files, stencil files, etc.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TAB 2: PCB Design */}
                        <div className="tab-pane fade" id="design" role="tabpanel">
                            <div className="row g-4 align-items-center">
                                <div className="col-md-7 text-center">
                                    <div className="process-image-wrapper">
                                        <img src="img/flow-design.png" alt="PCB Design Process" className="img-fluid process-image" />
                                    </div>
                                </div>

                                <div className="col-md-5">
                                    <div className="process-side">
                                        <h5>PCB Design Precautions</h5>
                                        <p><strong>Customers need to provide:</strong><br />Detailed functional requirements, size requirements, product operating environment conditions, whether product certification is required, etc.</p>
                                        <p><strong>PCBWay reviews schematic, layout, software file:</strong><br />According to PCBWay design specifications, design instructions, customer design requirements and related checklists.</p>
                                        <p><strong>Customers review schematic, layout, software file:</strong><br />PCBWay provides schematic and layout files for customers to review and confirm at each step.</p>
                                        <p><strong>Design Data Output:</strong><br />PCB manufacturing files, assembly files, stencil files, etc.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TAB 3: Mechanical Design */}
                        <div className="tab-pane fade" id="mech" role="tabpanel">
                            <div className="row g-4 align-items-center">
                                <div className="col-md-7 text-center">
                                    <div className="process-image-wrapper">
                                        <img src="img/flow-mechanical.png" alt="Mechanical/Enclosure Design Process" className="img-fluid process-image" />
                                    </div>
                                </div>

                                <div className="col-md-5">
                                    <div className="process-side">
                                        <h5>Mechanical/Enclosure Design Precautions</h5>
                                        <p><strong>Customers need to provide:</strong><br />Detailed design requirements, product operating environment conditions, whether product certification is required, etc.</p>
                                        <p><strong>PCBWay reviews schematic, layout, software file:</strong><br />According to PCBWay design specifications, design instructions, customer design requirements and related checklists.</p>
                                        <p><strong>Customers review schematic, layout, software file:</strong><br />PCBWay provides 3D design file for customers to review. Customers need to finally confirm the files.</p>
                                        <p><strong>Design Data Output:</strong><br />We will provide 3D design file.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/*ordering to design End */}
            
            <Footer />
        </div>
    );
};

export default PcbDesign;
