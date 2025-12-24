import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../hooks/useAddresses';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import CartShipmentAddress from '../components/CartShipmentAddress';

const QuotationDetails = () => {
    const location = useLocation();
    const { quotationId } = useParams();
    const { user, token } = useAuth();
    const { setAddressesList } = useAddresses();
    const navigate = useNavigate();
    const [quotation, setQuotation] = useState(location.state?.quotation || null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(!location.state?.quotation);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    const fetchUserAddresses = useCallback(async () => {
        if (!user || !token) return;
        try {
            const API_URL = process.env.REACT_APP_API_URL;
            const userId = user.userId || user._id || user.id;
            const response = await fetch(`${API_URL}/auth/getprofile?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUserProfile(data.data);
                if (data.data?.addresses && Array.isArray(data.data.addresses)) {
                    setAddressesList(data.data.addresses);
                    if (data.data.addresses.length > 0) {
                        setSelectedAddress(data.data.addresses[0]);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        }
    }, [user, token, setAddressesList]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!quotation && quotationId) {
            fetchQuotationDetails();
        }

        fetchUserAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, quotationId, navigate]);

    const fetchQuotationDetails = async () => {
        try {
            setFetchingData(true);
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/quotations/${quotationId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setQuotation(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch quotation details');
            }
        } catch (err) {
            console.error('Error fetching quotation:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to load quotation details',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            }).then(() => {
                navigate('/quotations');
            });
        } finally {
            setFetchingData(false);
        }
    };

    const handleAcceptQuote = async () => {
        const result = await Swal.fire({
            title: 'Accept Quote',
            text: 'Are you sure you want to accept this quotation?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Accept',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const formData = new FormData();
            formData.append('action', 'accept');

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/quotations/${quotation.quotation_id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                Swal.fire({
                    title: 'Success',
                    text: 'Quotation accepted successfully',
                    icon: 'success',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                setQuotation(data.data);
            } else {
                throw new Error(data.message || 'Failed to accept quotation');
            }
        } catch (err) {
            console.error('Error accepting quotation:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to accept quotation',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    };

    const handleRequestRequote = async () => {
        const { value: reason } = await Swal.fire({
            title: 'Request Requote',
            input: 'textarea',
            inputLabel: 'Please provide a reason for requesting a requote',
            inputPlaceholder: 'Enter your reason here...',
            inputAttributes: {
                'aria-label': 'Reason for requote'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit Request',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'Please provide a reason for requesting a requote';
                }
            }
        });

        if (!reason) return;

        try {
            const formData = new FormData();
            formData.append('action', 'requote');
            formData.append('reason', reason);

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/quotations/${quotation.quotation_id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                Swal.fire({
                    title: 'Success',
                    text: 'Requote request submitted successfully',
                    icon: 'success',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                setQuotation(data.data);
            } else {
                throw new Error(data.message || 'Failed to request requote');
            }
        } catch (err) {
            console.error('Error requesting requote:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to request requote',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    };

    const handleRejectQuote = async () => {
        const { value: reason } = await Swal.fire({
            title: 'Reject Quote',
            input: 'textarea',
            inputLabel: 'Please provide a reason for rejecting this quote',
            inputPlaceholder: 'Enter your reason here...',
            showCancelButton: true,
            confirmButtonText: 'Reject Quote',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'Please provide a reason for rejection';
                }
            }
        });

        if (!reason) return;

        try {
            const formData = new FormData();
            formData.append('action', 'reject');
            formData.append('reason', reason);

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/website/quotations/${quotation.quotation_id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                Swal.fire({
                    title: 'Rejected',
                    text: 'Quotation rejected successfully',
                    icon: 'success',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                setQuotation(data.data);
            } else {
                throw new Error(data.message || 'Failed to reject quotation');
            }
        } catch (err) {
            console.error('Error rejecting quotation:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to reject quotation',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    };

    const handlePayment = async () => {
        if (!selectedAddress) {
            Swal.fire({
                title: 'Address Required',
                text: 'Please select a shipping address before making payment',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true);

        try {
            const API_URL = process.env.REACT_APP_API_URL;
            const orderData = {
                quotation_id: quotation.quotation_id,
                service_id: quotation.service_id,
                service_code: quotation.service_code,
                service_name: quotation.service_name,
                pcb_name: quotation.pcb_name,
                config: quotation.config,
                amount: quotation.quoted_amount,
                paymentType: 'razorpay',
                quotationAddress: selectedAddress,
            };

            console.log('Creating order from quotation:', orderData);
            
            const response = await fetch(`${API_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();
            console.log('Order creation response:', result);

            if (result.status !== 'success' || !result.data?.razorpayOrder?.id) {
                Swal.fire('Error', result.message || 'Order creation failed', 'error');
                setLoading(false);
                return;
            }

            const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;
            const options = {
                key: RAZORPAY_KEY,
                amount: result.data.razorpayOrder.amount,
                currency: 'INR',
                order_id: result.data.razorpayOrder.id,
                name: quotation.service_name || 'Quotation Payment',
                description: `Payment for ${quotation.pcb_name || 'PCB Service'}`,
                handler: async (response) => {
                    Swal.fire({
                        title: 'Verifying Your Payment',
                        text: 'Please wait while we verify your payment...',
                        icon: 'info',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    try {
                        const verifyRes = await fetch(`${API_URL}/orders/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(response),
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyData.status === 'success' || verifyRes.ok) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Payment Successful',
                                text: 'Your order has been placed!',
                                timer: 2000,
                                showConfirmButton: false,
                            }).then(() => {
                                navigate('/orders');
                            });
                        } else {
                            Swal.fire('Error', 'Payment verification failed', 'error');
                        }
                    } catch (error) {
                        Swal.fire('Error', error.message || 'Payment verification failed', 'error');
                    }
                },
                modal: {
                    ondismiss: async () => {
                        await fetch(`${API_URL}/orders/cancel`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ 
                                reason: 'User cancelled', 
                                orderId: result.data.orderId 
                            }),
                        });
                        Swal.fire('Payment Cancelled', 'You cancelled the payment', 'warning');
                        setLoading(false);
                    },
                },
                prefill: { 
                    name: user?.name, 
                    email: user?.email, 
                    contact: user?.phone 
                },
                theme: { color: '#10304e' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

            rzp.on('payment.failed', function (response) {
                Swal.fire('Payment Failed', response.error.description, 'error');
                setLoading(false);
            });

            setLoading(false);
        } catch (err) {
            console.error('Payment error:', err);
            Swal.fire('Error', err.message || 'An error occurred during payment', 'error');
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'bg-warning text-dark', label: 'Pending' },
            quoted: { class: 'bg-info text-white', label: 'Quoted' },
            accepted: { class: 'bg-success', label: 'Accepted' },
            requote_requested: { class: 'bg-primary', label: 'Requote Requested' },
            rejected: { class: 'bg-danger', label: 'Rejected' },
            cancelled: { class: 'bg-secondary', label: 'Cancelled' }
        };
        const config = statusConfig[status] || { class: 'bg-secondary', label: status };
        return <span className={`badge ${config.class}`}>{config.label}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderConfigValue = (key, value) => {
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return value?.toString() || '-';
    };

    if (fetchingData || (loading && !quotation)) {
        return (
            <div>
                <Navbar />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading quotation details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!quotation && !fetchingData) {
        return (
            <div>
                <Navbar />
                <div className="container py-5 text-center">
                    <h3 className="text-danger">Quotation not found</h3>
                    <Link to="/quotations" className="btn btn-primary mt-3">
                        Back to Quotations
                    </Link>
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
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <h5 className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></h5>
                                    <h5 className="breadcrumb-item"><Link className="text-white" to="/quotations">Quotations</Link></h5>
                                    <h5 className="breadcrumb-item text-white active">Details</h5>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                <div className="row mb-3">
                    <div className="col-md-6">
                        <h3>Quotation Details</h3>
                    </div>
                    <div className="col-md-6 text-end">
                        <Link to="/quotations" className="btn btn-outline-primary">
                            <i className="fa fa-arrow-left me-2"></i>
                            Back to List
                        </Link>
                    </div>
                </div>

                <div className="row g-4" >
                    <div className="col-lg-8">
                        <div className="shadow-sm pcb-layout-container">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0" style={{color:'white'}}>
                                    <i className="fa fa-info-circle me-2"></i>
                                    Quotation Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Quotation ID:</strong>
                                        <p className="text-muted">{quotation.quotation_id}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Status:</strong>
                                        <p>{getStatusBadge(quotation.status)}</p>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Service Name:</strong>
                                        <p className="text-muted">{quotation.service_name}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Service Code:</strong>
                                        <p className="text-muted">{quotation.service_code}</p>
                                    </div>
                                </div>

                                {quotation.pcb_name && (
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <strong>PCB Name:</strong>
                                            <p className="text-muted">{quotation.pcb_name}</p>
                                        </div>
                                    </div>
                                )}

                                {quotation.description && (
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <strong>Description:</strong>
                                            <p className="text-muted">{quotation.description}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Created Date:</strong>
                                        <p className="text-muted">{formatDate(quotation.createdAt)}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Last Updated:</strong>
                                        <p className="text-muted">{formatDate(quotation.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {quotation.config && Object.keys(quotation.config).length > 0 && (
                            <div className="shadow-sm mt-4 w-sm pcb-layout-container">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0" style={{color:'white'}}>
                                        <i className="fa fa-cog me-2"></i>
                                        Configuration Details
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {Object.entries(quotation.config).map(([key, value]) => (
                                            <div className="col-md-6 mb-3" key={key}>
                                                <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong>
                                                <p className="text-muted">{renderConfigValue(key, value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {quotation.files && quotation.files.length > 0 && (
                            <div className="shadow-sm mt-4 w-sm pcb-layout-container">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0" style={{ color: 'white' }}>
                                        <i className="fa fa-file me-2"></i>
                                        Uploaded Files
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="list-group">
                                        {quotation.files.map((file, index) => (
                                            <div className="list-group-item" key={index}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <i className="fa fa-file-o me-2"></i>
                                                        <strong>{file.originalName}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            Size: {(file.size / 1024).toFixed(2)} KB | 
                                                            Type: {file.mimetype}
                                                        </small>
                                                    </div>
                                                    <a
                                                        href={`${process.env.REACT_APP_API_URL}/${file.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        <i className="fa fa-download me-1"></i>
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {quotation.history && quotation.history.length > 0 && (
                            <div className="shadow-sm mt-4 w-sm pcb-layout-container">
                                <div className="card-header bg-primary text-dark">
                                    <h5 className="mb-0" style={{color:'white'}}>
                                        <i className="fa fa-history me-2"></i>
                                        History
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="timeline">
                                        {quotation.history.map((entry, index) => (
                                            <div className="mb-3 pb-3 border-bottom" key={index}>
                                                <div className="d-flex justify-content-between">
                                                    <strong>{entry.action}</strong>
                                                    <small className="text-muted">
                                                        {formatDate(entry.updatedAt)}
                                                    </small>
                                                </div>
                                                {entry.status && (
                                                    <div className="mt-1">
                                                        Status: {getStatusBadge(entry.status)}
                                                    </div>
                                                )}
                                                {entry.reason && (
                                                    <p className="text-muted mt-2 mb-0">{entry.reason}</p>
                                                )}
                                                {entry.updatedBy && (
                                                    <small className="text-muted">By: {entry.updatedBy}</small>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-lg-4">
                        <div className="shadow-sm w-sm pcb-layout-container">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0" style={{color:'white'}}>
                                    <i className="fa fa-rupee me-2"></i>
                                    Pricing Information
                                </h5>
                            </div>
                            <div className="card-body">
                                {quotation.quoted_amount ? (
                                    <>
                                        <div className="text-center mb-3">
                                            <h2 className="text-primary">
                                                ₹{quotation.quoted_amount.toLocaleString()}
                                            </h2>
                                            <p className="text-muted">Quoted Amount</p>
                                        </div>
                                        {quotation.status === 'quoted' && (
                                            <div className="d-grid gap-2">
                                                <button 
                                                    className="btn btn-success"
                                                    onClick={handleAcceptQuote}
                                                    disabled={loading}
                                                >
                                                    <i className="fa fa-check me-2"></i>
                                                    Accept Quote
                                                </button>
                                                <button 
                                                    className="btn btn-outline-primary"
                                                    onClick={handleRequestRequote}
                                                    disabled={loading}
                                                >
                                                    <i className="fa fa-refresh me-2"></i>
                                                    Request Requote
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger"
                                                    onClick={handleRejectQuote}
                                                    disabled={loading}
                                                >
                                                    <i className="fa fa-times me-2"></i>
                                                    Reject Quote
                                                </button>
                                            </div>
                                        )}
                                        {quotation.status === 'accepted' && (
                                            quotation.ispayment ? (
                                                <div className="text-center">
                                                    <div className="alert alert-success mb-3">
                                                        <i className="fa fa-check-circle fa-2x mb-2"></i>
                                                        <h5 className="mb-0">Payment Success</h5>
                                                        <p className="mb-0 small text-muted">Your payment has been completed successfully</p>
                                                    </div>
                                                    <button 
                                                        className="btn btn-primary btn-lg w-100"
                                                        onClick={() => navigate('/orders')}
                                                    >
                                                        <i className="fa fa-shopping-bag me-2"></i>
                                                        View Order
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="mb-3">
                                                        <CartShipmentAddress
                                                            selectedAddress={selectedAddress}
                                                            onAddressSelect={setSelectedAddress}
                                                            userProfile={userProfile}
                                                            onAddressAdded={fetchUserAddresses}
                                                        />
                                                    </div>
                                                    <div className="d-grid gap-2">
                                                        <button 
                                                            className="btn btn-success btn-lg"
                                                            onClick={handlePayment}
                                                            disabled={loading || !selectedAddress}
                                                        >
                                                            <i className="fa fa-credit-card me-2"></i>
                                                            {loading ? 'Processing...' : 'Make Payment'}
                                                        </button>
                                                        <small className="text-center text-muted">
                                                            <i className="fa fa-lock me-1"></i>
                                                            Secure payment via Razorpay
                                                        </small>
                                                    </div>
                                                </>
                                            )
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="fa fa-clock-o fa-3x text-muted mb-3"></i>
                                        <p className="text-muted">
                                            Quotation is being processed. You will receive the quoted amount soon.
                                        </p>
                                    </div>
                                )}

                                {quotation.admin_reason && (
                                    <div className="mt-3">
                                        <strong>Admin Note:</strong>
                                        <p className="text-muted small">{quotation.admin_reason}</p>
                                    </div>
                                )}

                                {quotation.user_reason && (
                                    <div className="mt-3">
                                        <strong>Your Note:</strong>
                                        <p className="text-muted small">{quotation.user_reason}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default QuotationDetails;
