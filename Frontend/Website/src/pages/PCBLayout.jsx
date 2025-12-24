import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePCBLayoutServices } from '../hooks/usePCBLayoutServices';
import Swal from 'sweetalert2';
import '../assets/css/PCBLayout.css';

const PCBLayout = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { services, loading, error } = usePCBLayoutServices();
    const [selections, setSelections] = useState({
        pcb_name: '',
        layers: '2',
        components: '0-75',
        lead_time: '2',
        controlled_impedance: 'false',
        dimension_x: '100',
        dimension_y: '100',
        pcb_type: 'regular',
        delivery_format: [],
        material: '',
        surface_finish: '',
        fpc_thickness: '',
    });

    const [files, setFiles] = useState([]);
    const [description, setDescription] = useState('');

    const [dimensionErrors, setDimensionErrors] = useState({
        dimension_x: '',
        dimension_y: ''
    });



    const validateDimensions = () => {
        const dimConfig = services?.config?.dimension;
        if (!dimConfig) return { valid: true };

        const dimX = parseFloat(selections.dimension_x);
        const dimY = parseFloat(selections.dimension_y);

        if (isNaN(dimX) || isNaN(dimY)) {
            return { valid: false, message: 'Please enter valid Dimension X and Y values' };
        }

        const minX = dimConfig.min?.x;
        const maxX = dimConfig.max?.x;
        const minY = dimConfig.min?.y;
        const maxY = dimConfig.max?.y;

        if (dimX < minX || dimX > maxX) {
            return { valid: false, message: `Dimension X must be between ${minX} and ${maxX} mm` };
        }

        if (dimY < minY || dimY > maxY) {
            return { valid: false, message: `Dimension Y must be between ${minY} and ${maxY} mm` };
        }

        return { valid: true };
    };

    const isFormValid = () => {
        if (!selections.pcb_name.trim()) return false;
        if (!selections.layers) return false;
        if (!selections.components) return false;
        if (!selections.dimension_x || !selections.dimension_y) return false;
        
        if (dimensionErrors.dimension_x || dimensionErrors.dimension_y) return false;
        
        const dimensionValidation = validateDimensions();
        if (!dimensionValidation.valid) return false;
        
        if (!selections.lead_time) return false;
        if (!selections.pcb_type) return false;
        if (!selections.delivery_format || selections.delivery_format.length === 0) return false;
        
        if (selections.pcb_type === 'flex') {
            if (!selections.material) return false;
            if (!selections.surface_finish) return false;
            if (!selections.fpc_thickness) return false;
        }
        
        if (files.length === 0) return false;
        
        return true;
    };

    const handleSelectChange = (field, value) => {
        setSelections(prev => {
            const newSelections = {
                ...prev,
                [field]: value
            };
            
            if (field === 'pcb_type' && value !== 'flex') {
                newSelections.material = '';
                newSelections.surface_finish = '';
                newSelections.fpc_thickness = '';
            }
            
            return newSelections;
        });
    };

    const handleInputChange = (field, value) => {
        setSelections(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'dimension_x' || field === 'dimension_y') {
            const dimConfig = services?.config?.dimension;
            if (dimConfig) {
                const numValue = parseFloat(value);
                let errorMsg = '';

                if (value && !isNaN(numValue)) {
                    if (field === 'dimension_x') {
                        const minX = dimConfig.min?.x;
                        const maxX = dimConfig.max?.x;
                        if (numValue < minX) {
                            errorMsg = `Minimum value is ${minX} mm`;
                        } else if (numValue > maxX) {
                            errorMsg = `Maximum value is ${maxX} mm`;
                        }
                    } else if (field === 'dimension_y') {
                        const minY = dimConfig.min?.y;
                        const maxY = dimConfig.max?.y;
                        if (numValue < minY) {
                            errorMsg = `Minimum value is ${minY} mm`;
                        } else if (numValue > maxY) {
                            errorMsg = `Maximum value is ${maxY} mm`;
                        }
                    }
                }

                setDimensionErrors(prev => ({
                    ...prev,
                    [field]: errorMsg
                }));
            }
        }
    };

    const handleMultiSelectChange = (field, value) => {
        setSelections(prev => {
            const currentValues = prev[field] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return {
                ...prev,
                [field]: newValues
            };
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 5) {
            Swal.fire({
                title: 'Error',
                text: 'You can upload maximum 5 files',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }
        setFiles(selectedFiles);
    };

    const handleRequestQuotation = async () => {
        if (!user) {
            const result = await Swal.fire({
                title: 'Login Required',
                text: 'Please login to request quotation',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                window.location.href = '/login';
            }
            return;
        }

        if (!isFormValid()) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill all required fields',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('service_id', services.service_id);
            formData.append('service_code', services.code);
            formData.append('service_name', services.name);
            formData.append('pcb_name', selections.pcb_name);
            formData.append('config', JSON.stringify(selections));
            formData.append('description', description);

            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch(`${process.env.REACT_APP_API_URL}/quotations/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Swal.fire({
                    title: 'Success',
                    text: 'Quotation request submitted successfully',
                    icon: 'success',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => {
                    setSelections({
                        pcb_name: '',
                        layers: '2',
                        components: '0-75',
                        lead_time: '2',
                        controlled_impedance: 'false',
                        dimension_x: '100',
                        dimension_y: '100',
                        pcb_type: 'regular',
                        delivery_format: [],
                        material: '',
                        surface_finish: '',
                        fpc_thickness: '',
                    });
                    setFiles([]);
                    setDescription('');
                    navigate('/quotations');
                });
            } else {
                throw new Error(data.message || 'Failed to submit quotation request');
            }
        } catch (err) {
            console.error('Quotation Error:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to submit quotation request',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    };



    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="container py-5 text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !services) {
        return (
            <div>
                <Navbar />
                <div className="container py-5 text-center">
                    <h3 className="text-danger">Failed to load PCB Layout service</h3>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            
            <div className="container-fluid bg-primary hero-header" style={{ height: '15vh' }}>
                <div className="container pt-4">
                    <div className="row g-5 pt-5">
                        <div className="col-lg-12 text-center">
                            {/* <h1 className="display-4 text-white mb-4 animated slideInRight">PCB Layout</h1> */}
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <h5 className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></h5>
                                    <h5 className="breadcrumb-item text-white active">PCB Layout</h5>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="pcb-layout-container">
                            <div className="pcb-layout-form">
                                <h3>PCB Layout Configurator</h3>

                                <div className="form-group-section">
                                    <div className="form-section-title">Product Details</div>

                                    <div className="form-group ">
                                        <label className="form-label fw-bold">
                                            PCB Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Enter PCB Name"
                                            value={selections.pcb_name}
                                            onChange={(e) => handleInputChange('pcb_name', e.target.value)}
                                            style={{ maxWidth: '300px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group-section">
                                    <div className="form-section-title">PCB Specifications</div>

                                    <div className="row ">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Layers <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                value={selections.layers}
                                                onChange={(e) => handleSelectChange('layers', e.target.value)}
                                            >
                                                {services.config?.layers?.options?.map(layer => (
                                                    <option key={layer} value={layer}>{layer} Layer{layer > 1 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Components <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                value={selections.components}
                                                onChange={(e) => handleSelectChange('components', e.target.value)}
                                            >
                                                {(services.config?.components?.options?.length > 0
                                                    ? services.config.components.options
                                                    : [75, 100, 250]).map(comp => (
                                                        <option key={comp} value={comp}>{comp} or less</option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row ">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Dimension X (mm) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className={`form-control ${dimensionErrors.dimension_x ? 'is-invalid' : ''}`}
                                                value={selections.dimension_x}
                                                onChange={(e) => handleInputChange('dimension_x', e.target.value)}
                                                min={services?.config?.dimension?.min?.x || 100}
                                                max={services?.config?.dimension?.max?.x || 500}
                                            />
                                            {dimensionErrors.dimension_x ? (
                                                <small className="text-danger d-block mt-1">
                                                    {dimensionErrors.dimension_x}
                                                </small>
                                            ) : services?.config?.dimension && (
                                                <small className="form-text text-muted">
                                                    Range: {services.config.dimension.min?.x} - {services.config.dimension.max?.x} mm
                                                </small>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Dimension Y (mm) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className={`form-control ${dimensionErrors.dimension_y ? 'is-invalid' : ''}`}
                                                value={selections.dimension_y}
                                                onChange={(e) => handleInputChange('dimension_y', e.target.value)}
                                                min={services?.config?.dimension?.min?.y || 200}
                                                max={services?.config?.dimension?.max?.y || 400}
                                            />
                                            {dimensionErrors.dimension_y ? (
                                                <small className="text-danger d-block mt-1">
                                                    {dimensionErrors.dimension_y}
                                                </small>
                                            ) : services?.config?.dimension && (
                                                <small className="form-text text-muted">
                                                    Range: {services.config.dimension.min?.y} - {services.config.dimension.max?.y} mm
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group-section">
                                    <div className="form-section-title">Delivery & Options</div>

                                    <div className="row ">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Lead Time <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                value={selections.lead_time}
                                                onChange={(e) => handleSelectChange('lead_time', e.target.value)}
                                            >
                                                {(services.config?.lead_time_days?.options?.length > 0
                                                    ? services.config.lead_time_days.options
                                                    : [3, 5, 10]).map(days => (
                                                        <option key={days} value={days}>{days} Working Days</option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Control Impedance
                                            </label>
                                            <div className="button-group mt-2">
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm btn-impedance ${selections.controlled_impedance === 'false' || selections.controlled_impedance === false ? 'active' : ''}`}
                                                    onClick={() => handleSelectChange('controlled_impedance', 'false')}
                                                >
                                                    No
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm btn-impedance ${selections.controlled_impedance === 'true' || selections.controlled_impedance === true ? 'active' : ''}`}
                                                    onClick={() => handleSelectChange('controlled_impedance', 'true')}
                                                >
                                                    Yes
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row ">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                PCB Type <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                value={selections.pcb_type}
                                                onChange={(e) => handleSelectChange('pcb_type', e.target.value)}
                                            >
                                                <option value="">Select PCB Type</option>
                                                {services.config?.pcb_type?.options?.map(type => (
                                                    <option key={type} value={type}>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Delivery Format <span className="text-danger">*</span>
                                            </label>
                                            <small className="d-block text-muted mb-2">Select one or more formats</small>
                                            <div className="mt-2" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', paddingLeft:'20px'}}>
                                                {services.config?.delivery_format?.options?.map(format => (
                                                    <div key={format} className="form-check" style={{ minWidth: '100px' }}>
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`delivery-${format}`}
                                                            checked={selections.delivery_format.includes(format)}
                                                            onChange={() => handleMultiSelectChange('delivery_format', format)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`delivery-${format}`} style={{ cursor: 'pointer' }}>
                                                            {format}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {selections.pcb_type === 'flex' && (
                                        <>
                                            <div className="row mt-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold">
                                                        Material <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={selections.material}
                                                        onChange={(e) => handleSelectChange('material', e.target.value)}
                                                    >
                                                        <option value="">Select Material</option>
                                                        {services.config?.material?.options?.map(mat => (
                                                            <option key={mat} value={mat}>
                                                                {mat}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold">
                                                        Surface Finish <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={selections.surface_finish}
                                                        onChange={(e) => handleSelectChange('surface_finish', e.target.value)}
                                                    >
                                                        <option value="">Select Surface Finish</option>
                                                        {services.config?.surface_finish?.options?.map(finish => (
                                                            <option key={finish} value={finish}>
                                                                {finish}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="row mt-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold">
                                                        FPC Thickness <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={selections.fpc_thickness}
                                                        onChange={(e) => handleSelectChange('fpc_thickness', e.target.value)}
                                                    >
                                                        <option value="">Select FPC Thickness</option>
                                                        {services.config?.fpc_thickness?.options?.map(thickness => (
                                                            <option key={thickness} value={thickness}>
                                                                {thickness}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label fw-bold">Additional Description</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        placeholder="Enter additional requirements or notes"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group" style={{paddingTop:'10px'}}>
                                    <label className="form-label fw-bold">
                                        Upload Files (1-5 files) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control form-control-sm"
                                        multiple
                                        accept=".pdf,.zip,.rar,.gerber,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                    />
                                    {files.length > 0 && (
                                        <small className="text-muted">
                                            {files.length} file(s) selected
                                        </small>
                                    )}
                                </div>

                                <div className="d-flex gap-2" style={{ alignItems: 'center', padding:'10px'}}>
                                    <button
                                        className="btn btn-success btn-cart"
                                        onClick={handleRequestQuotation}
                                        disabled={!isFormValid()}
                                    >
                                        <i className="fa fa-file-text me-2"></i>
                                        Request Quotation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="pricing-card">
                            <h4>Quotation Information</h4>
                            <div style={{ padding: '1rem 0' }}>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                                    Submit your PCB layout requirements and our team will review your specifications 
                                    and provide you with a detailed quotation.
                                </p>
                                <ul style={{ fontSize: '14px', lineHeight: '1.8', color: '#666', paddingLeft: '1.2rem' }}>
                                    <li>Fill in all required fields</li>
                                    <li>Upload relevant design files</li>
                                    <li>Add any special requirements</li>
                                    <li>Submit your request</li>
                                    <li>Receive quote within 24-48 hours</li>
                                </ul>
                                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                    <Link to="/quotations" className="btn btn-outline-primary btn-sm w-100">
                                        <i className="fa fa-list me-2"></i>
                                        View My Quotations
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PCBLayout;
