import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FileViewer from '../components/FileViewer';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePCBLayoutServices } from '../hooks/usePCBLayoutServices';
import { usePriceCalculation } from '../hooks/usePriceCalculation';
import Swal from 'sweetalert2';
import '../assets/css/PCBLayout.css';

const PCBLayout = () => {
    const { user, token } = useAuth();
    const { fetchCart, updateCart } = useCart();
    const { services, loading, error } = usePCBLayoutServices();
    const [viewingFile, setViewingFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [selections, setSelections] = useState({
        pcb_name: '',
        layers: '1',
        components: '100',
        lead_time: '3',
        controlled_impedance: false,
        dimension_x: '100',
        dimension_y: '100',
        pcb_type: '',
        delivery_format: [],
        material: '',
        surface_finish: '',
        fpc_thickness: '',
    });

    const [files, setFiles] = useState({
        schematic: null,
        bom: null,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editingCartItem, setEditingCartItem] = useState(null);
    const [originalSelections, setOriginalSelections] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [dimensionErrors, setDimensionErrors] = useState({
        dimension_x: '',
        dimension_y: ''
    });

    const pricing = usePriceCalculation(selections, services?.config, services?.base_price);

    useEffect(() => {
        const editItem = localStorage.getItem('editingCartItem');
        if (editItem) {
            try {
                const item = JSON.parse(editItem);
                setEditingCartItem(item);
                setIsEditing(true);
                const config = item.config;
                const initialSelections = {
                    pcb_name: item.pcb_name || '',
                    layers: config?.layers?.toString() || '1',
                    components: config?.components?.toString() || '100',
                    lead_time: config?.lead_time?.toString() || '3',
                    controlled_impedance: config?.controlled_impedance || false,
                    dimension_x: config?.dimension_x?.toString() || '100',
                    dimension_y: config?.dimension_y?.toString() || '100',
                    pcb_type: config?.pcb_type || '',
                    delivery_format: Array.isArray(config?.delivery_format) ? config.delivery_format : (config?.delivery_format ? [config.delivery_format] : []),
                    material: config?.material || '',
                    surface_finish: config?.surface_finish || '',
                    fpc_thickness: config?.fpc_thickness || '',
                };
                setSelections(initialSelections);
                setOriginalSelections(initialSelections);
                localStorage.removeItem('editingCartItem');
            } catch (err) {
                console.error('Error loading editing item:', err);
            }
        } else {
            const savedSelections = localStorage.getItem('pcbLayoutSelections');
            if (savedSelections) {
                try {
                    setSelections(JSON.parse(savedSelections));
                } catch (err) {
                    console.error('Error loading saved selections:', err);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!isEditing) {
            localStorage.setItem('pcbLayoutSelections', JSON.stringify(selections));
        }
    }, [selections, isEditing]);

    useEffect(() => {
        if (isEditing && originalSelections) {
            const selectionsChanged = JSON.stringify(selections) !== JSON.stringify(originalSelections);
            const filesChanged = files.schematic !== null || files.bom !== null;
            setHasChanges(selectionsChanged || filesChanged);
        }
    }, [selections, files, isEditing, originalSelections]);

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
        
        if (!isEditing) {
            if (!files.schematic) return false;
            if (!files.bom) return false;
        } else {
            if (!files.schematic && !editingCartItem?.files?.schematic) return false;
            if (!files.bom && !editingCartItem?.files?.bom) return false;
        }
        
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

    const handleCheckboxChange = (field) => {
        setSelections(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
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

    const handleFileChange = (field, file) => {
        if (file) {
            setFiles(prev => ({
                ...prev,
                [field]: file
            }));
        }
    };

    const handleAddToCart = async () => {
        if (!selections.pcb_name.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter PCB Name',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.layers) {
            Swal.fire({
                title: 'Error',
                text: 'Please select Layers',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.components) {
            Swal.fire({
                title: 'Error',
                text: 'Please select Components',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        const dimensionValidation = validateDimensions();
        if (!dimensionValidation.valid) {
            Swal.fire({
                title: 'Error',
                text: dimensionValidation.message,
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.lead_time) {
            Swal.fire({
                title: 'Error',
                text: 'Please select Lead Time',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.pcb_type) {
            Swal.fire({
                title: 'Error',
                text: 'Please select PCB Type',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.delivery_format || selections.delivery_format.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Please select at least one Delivery Format',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (selections.pcb_type === 'flex') {
            if (!selections.material) {
                Swal.fire({
                    title: 'Error',
                    text: 'Please select Material for Flex PCB',
                    icon: 'error',
                    timer: 5000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                return;
            }

            if (!selections.surface_finish) {
                Swal.fire({
                    title: 'Error',
                    text: 'Please select Surface Finish for Flex PCB',
                    icon: 'error',
                    timer: 5000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                return;
            }

            if (!selections.fpc_thickness) {
                Swal.fire({
                    title: 'Error',
                    text: 'Please select FPC Thickness for Flex PCB',
                    icon: 'error',
                    timer: 5000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                return;
            }
        }

        if (!files.schematic) {
            Swal.fire({
                title: 'Error',
                text: 'Please upload Schematic File (JPG, PNG)',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!files.bom) {
            Swal.fire({
                title: 'Error',
                text: 'Please upload Bill of Materials (PDF)',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!user) {
            const result = await Swal.fire({
                title: 'Login Required',
                text: 'Please login to add items to cart',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Continue Shopping'
            });

            if (result.isConfirmed) {
                window.location.href = '/login';
            }
            return;
        }

        try {
            const formData = new FormData();
            formData.append('user_id', user?._id || user?.id);
            formData.append('service_id', services._id);
            formData.append('service_code', services.code);
            formData.append('service_name', services.name);
            formData.append('pcb_name', selections.pcb_name);
            formData.append('config', JSON.stringify(selections));

            formData.append('lead_time', selections.lead_time);
            formData.append('order_value', pricing.orderValue);
            formData.append('tax', pricing.tax);
            formData.append('total_price', pricing.totalPrice);
            formData.append('shipment_date', pricing.shipmentDate);

            if (files.schematic) {
                formData.append('schematic', files.schematic);
            }
            if (files.bom) {
                formData.append('bom', files.bom);
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            let data;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON Response:', text);
                throw new Error(`Server returned: ${response.status} ${response.statusText}`);
            }

            if (response.ok && data.success) {
                await fetchCart(token);
                Swal.fire({
                    title: 'Success',
                    text: 'Item added to cart successfully',
                    icon: 'success',
                    timer: 5000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => {
                    setSelections({
                        pcb_name: '',
                        layers: '1',
                        components: '100',
                        lead_time: '3',
                        controlled_impedance: false,
                        dimension_x: '100',
                        dimension_y: '100',
                        pcb_type: '',
                        delivery_format: [],
                        material: '',
                        surface_finish: '',
                        fpc_thickness: '',
                    });
                    setFiles({ schematic: null, bom: null });
                    window.location.href = '/cart';
                });
            } else {
                throw new Error(data.message || 'Failed to add to cart');
            }
        } catch (err) {
            console.error('Cart Error:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to add to cart',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    };

    const handleUpdateCart = async () => {
        if (!selections.pcb_name.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter PCB Name',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.layers) {
            Swal.fire({
                title: 'Error',
                text: 'Please select Layers',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.components) {
            Swal.fire({
                title: 'Error',
                text: 'Please select Components',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        const dimensionValidation = validateDimensions();
        if (!dimensionValidation.valid) {
            Swal.fire({
                title: 'Error',
                text: dimensionValidation.message,
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.lead_time) {
            Swal.fire({
                title: 'Error',
                text: 'Please select Lead Time',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.pcb_type) {
            Swal.fire({
                title: 'Error',
                text: 'Please select PCB Type',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!selections.delivery_format || selections.delivery_format.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Please select at least one Delivery Format',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!files.schematic && !editingCartItem?.files?.schematic) {
            Swal.fire({
                title: 'Error',
                text: 'Please upload Schematic File (JPG, PNG)',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!files.bom && !editingCartItem?.files?.bom) {
            Swal.fire({
                title: 'Error',
                text: 'Please upload Bill of Materials (PDF)',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        if (!editingCartItem?.cart_id) {
            Swal.fire({
                title: 'Error',
                text: 'Unable to update item',
                icon: 'error',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('pcb_name', selections.pcb_name);
            formData.append('config', JSON.stringify(selections));
            formData.append('lead_time', selections.lead_time);
            formData.append('order_value', pricing.orderValue);
            formData.append('tax', pricing.tax);
            formData.append('total_price', pricing.totalPrice);
            formData.append('shipment_date', pricing.shipmentDate);

            if (files.schematic) {
                formData.append('schematic', files.schematic);
            }
            if (files.bom) {
                formData.append('bom', files.bom);
            }

            await updateCart(editingCartItem.cart_id, formData, token);
            await fetchCart(token);

            Swal.fire({
                title: 'Updated Successfully',
                text: 'Cart item updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                setIsEditing(false);
                setEditingCartItem(null);
                setOriginalSelections(null);
                setHasChanges(false);
                setSelections({
                    pcb_name: '',
                    layers: '1',
                    components: '100',
                    lead_time: '3',
                    controlled_impedance: false,
                    dimension_x: '100',
                    dimension_y: '100',
                    pcb_type: '',
                    delivery_format: [],
                    material: '',
                    surface_finish: '',
                    fpc_thickness: '',
                });
                setFiles({ schematic: null, bom: null });
                window.location.href = '/cart';
            });
        } catch (err) {
            console.error('Update Error:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to update cart item',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const generateAlternatives = () => {
        if (!pricing || !services?.config?.lead_time_days) return [];

        const availableLeadTimes = services.config.lead_time_days.options || [];
        const currentMultiplier = services.config.lead_time_days.multiplier[selections.lead_time] || 1;

        const allAlternatives = availableLeadTimes.map(leadTime => {
            const leadTimeStr = leadTime.toString();
            const altMultiplier = services.config.lead_time_days.multiplier[leadTime] || 1;
            const priceRatio = altMultiplier / currentMultiplier;
            return {
                lead_time: leadTimeStr,
                price: Math.round(pricing.orderValue * priceRatio)
            };
        });

        return allAlternatives.filter(alt => alt.lead_time !== selections.lead_time);
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

    const alternatives = generateAlternatives();

    const handleViewFile = (filePath, type) => {
        console.log('handleViewFile - filePath:', filePath);
        console.log('handleViewFile - type:', type);
        setViewingFile(filePath);
        setFileType(type);
    };

    const handleCloseViewer = () => {
        setViewingFile(null);
        setFileType(null);
    };

    const getFileType = (mimetype) => {
        if (!mimetype) return 'file';
        if (mimetype.startsWith('image/')) return 'image';
        if (mimetype === 'application/pdf') return 'pdf';
        return 'file';
    };

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
                                <h3>PCB Layout Configurator {isEditing && <span style={{ color: '#fcb535', fontSize: '0.8em' }}>(Editing Mode)</span>}</h3>
                                {isEditing && (
                                    <div style={{
                                        backgroundColor: '#fcb535',
                                        color: '#10304e',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '6px',
                                        marginBottom: '1.5rem',
                                        fontWeight: '500'
                                    }}>
                                        <i className="fa fa-edit me-2"></i>You are editing this item. Make changes and click "Update Item" to save.
                                    </div>
                                )}

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
                                                    className={`btn btn-sm btn-impedance ${!selections.controlled_impedance ? 'active' : ''}`}
                                                    onClick={() => handleCheckboxChange('controlled_impedance')}
                                                >
                                                    No
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm btn-impedance ${selections.controlled_impedance ? 'active' : ''}`}
                                                    onClick={() => handleCheckboxChange('controlled_impedance')}
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

                                <div className="form-group-section">
                                    <div className="form-section-title">Upload Files</div>
                                    {isEditing && editingCartItem?.files && Object.keys(editingCartItem.files).length > 0 && (
                                        <div className="item-files mt-2">
                                            {editingCartItem.files.schematic && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleViewFile(editingCartItem.files.schematic.path, getFileType(editingCartItem.files.schematic.mimetype))}
                                                    title="View schematic"
                                                >
                                                    <i className="fa fa-image me-1"></i>View Schematic
                                                </button>
                                            )}

                                            {editingCartItem.files.bom && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleViewFile(editingCartItem.files.bom.path, getFileType(editingCartItem.files.bom.mimetype))}
                                                    title="View BOM"
                                                >
                                                    <i className="fa fa-file-pdf me-1"></i>View BOM
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <div className="row ">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Schematic File <span className="text-danger">*</span>
                                            </label>
                                            <small className="d-block text-muted mb-2">Supports: JPG, PNG</small>
                                            <div className="file-upload-wrapper">
                                                <input
                                                    type="file"
                                                    id="schematicFile"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange('schematic', e.target.files[0])}
                                                    accept=".png,.jpg,.jpeg"
                                                />
                                                {files.schematic && (
                                                    <small className="d-block mt-2">
                                                        ✓ {files.schematic.name}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Bill of Materials <span className="text-danger">*</span>
                                            </label>
                                            <small className="d-block text-muted mb-2">Supports: PDF</small>
                                            <div className="file-upload-wrapper">
                                                <input
                                                    type="file"
                                                    id="bomFile"
                                                    className="form-control"
                                                    onChange={(e) => handleFileChange('bom', e.target.files[0])}
                                                    accept=".pdf"
                                                />
                                                {files.bom && (
                                                    <small className="d-block mt-2">
                                                        ✓ {files.bom.name}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2" style={{ alignItems: 'center' }}>
                                    {isEditing && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditingCartItem(null);
                                                setOriginalSelections(null);
                                                setHasChanges(false);
                                                setSelections({
                                                    pcb_name: '',
                                                    layers: '1',
                                                    components: '100',
                                                    lead_time: '3',
                                                    controlled_impedance: false,
                                                    dimension_x: '100',
                                                    dimension_y: '100',
                                                    pcb_type: '',
                                                    delivery_format: [],
                                                    material: '',
                                                    surface_finish: '',
                                                    fpc_thickness: '',
                                                });
                                                setFiles({ schematic: null, bom: null });
                                            }}
                                        >
                                            <i className="fa fa-times me-2"></i> Cancel
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-success btn-cart"
                                        onClick={isEditing ? handleUpdateCart : handleAddToCart}
                                        disabled={!isFormValid() || (isEditing && !hasChanges)}
                                    >
                                        <i className={`fa ${isEditing ? 'fa-refresh' : 'fa-shopping-cart'} me-2`}></i>
                                        {isEditing ? 'Update Item' : 'Add To Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        {pricing && (
                            <>
                                <div className="pricing-card ">
                                    <h4>Calculated Price</h4>

                                    <div className="price-row">
                                        <span className="label">Lead Time:</span>
                                        <span className="value">{selections.lead_time} WD</span>
                                    </div>

                                    <div className="price-row">
                                        <span className="label">Order Value:</span>
                                        <span className="value">₹ {pricing.orderValue.toLocaleString()}</span>
                                    </div>

                                    <div className="price-row">
                                        <span className="label">Tax (18%):</span>
                                        <span className="value">₹ {pricing.tax.toLocaleString()}</span>
                                    </div>

                                    <div className="total-price-row">
                                        <span className="label">Total Price</span>
                                        <span className="value">₹ {pricing.totalPrice.toLocaleString()}</span>
                                    </div>

                                    <div className="price-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e8e8e8' }}>
                                        <span className="label">Shipment Date:</span>
                                        <span className="value">{pricing.shipmentDate}</span>
                                    </div>
                                </div>

                                {alternatives.length > 0 && (
                                    <div className="alternatives">
                                        <h5>Alternative Options</h5>

                                        {alternatives.map((alt, idx) => {
                                            const altTax = Math.round(alt.price * TAX_RATE);
                                            const altTotal = alt.price + altTax;
                                            return (
                                                <div key={idx} className="alternative-item">
                                                    <div className="price-row">
                                                        <span className="label">Lead Time:</span>
                                                        <span className="value">{alt.lead_time} WD</span>
                                                    </div>
                                                    <div className="price-row">
                                                        <span className="label">PCB Layout:</span>
                                                        <span className="value">₹ {alt.price.toLocaleString()}</span>
                                                    </div>
                                                    <div className="price-row">
                                                        <span className="label">Tax (18%):</span>
                                                        <span className="value">₹ {altTax.toLocaleString()}</span>
                                                    </div>
                                                    <div className="total-price-row" style={{ marginTop: '0.5rem' }}>
                                                        <span className="label">Total:</span>
                                                        <span className="value">₹ {altTotal.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {viewingFile && (
                <FileViewer
                    file={viewingFile}
                    type={fileType}
                    onClose={handleCloseViewer}
                />
            )}
            <Footer />
        </div>
    );
};

const TAX_RATE = 0.18;

export default PCBLayout;
