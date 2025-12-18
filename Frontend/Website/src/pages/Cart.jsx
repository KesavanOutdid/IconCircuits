import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FileViewer from '../components/FileViewer';
import CartShipmentAddress from '../components/CartShipmentAddress';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAddresses } from '../hooks/useAddresses';
import Swal from 'sweetalert2';
import '../assets/css/Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { cartItems, cartSummary, loading, fetchCart, removeCart, clearCart } = useCart();
    const { setAddressesList } = useAddresses();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [viewingFile, setViewingFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const fetchUserAddresses = useCallback(async () => {
        if (!user || !token) return;
        try {
            const API_URL = process.env.REACT_APP_API_URL;
            const userId = user.userId || user._id || user.id;
            console.log('Fetching profile for userId:', userId);
            console.log('API URL:', API_URL);
            const response = await fetch(`${API_URL}/auth/getprofile?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Profile data received:', data);
                console.log('✅ Addresses count:', data.data?.addresses?.length);
                setUserProfile(data.data);
                if (data.data?.addresses && Array.isArray(data.data.addresses)) {
                    console.log('✅ Setting addresses list:', data.data.addresses);
                    setAddressesList(data.data.addresses);
                    if (data.data.addresses.length > 0) {
                        console.log('✅ Auto-selecting first address:', data.data.addresses[0]);
                        setSelectedAddress(data.data.addresses[0]);
                    }
                } else {
                    console.warn('⚠️ No addresses in response or not an array');
                }
            } else {
                console.error('❌ Failed to fetch profile:', response.status);
                const errorData = await response.text();
                console.error('Error response:', errorData);
            }
        } catch (err) {
            console.error('❌ Failed to fetch addresses:', err);
        }
    }, [user, token, setAddressesList]);

    useEffect(() => {
        if (!user || !token) {
            navigate('/login');
            return;
        }
        fetchCart(token);
        fetchUserAddresses();
    }, [user, token, fetchCart, navigate, fetchUserAddresses]);

    const handleRemoveItem = async (cartId) => {
        const result = await Swal.fire({
            title: 'Remove Item',
            text: 'Are you sure you want to remove this item?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10304e',
            cancelButtonColor: '#ddd',
            confirmButtonText: 'Remove',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await removeCart(cartId, token);
                await fetchCart(token);
                Swal.fire({
                    title: 'Removed Successfully',
                    text: 'Item removed from cart',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: err.message || 'Failed to remove item',
                    icon: 'error',
                });
            }
        }
    };

    const handleClearCart = async () => {
        const result = await Swal.fire({
            title: 'Clear Cart',
            text: 'This will remove all items. Continue?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d9534f',
            cancelButtonColor: '#10304e',
            confirmButtonText: 'Clear All',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await clearCart(token);
                await fetchCart(token);
                Swal.fire({
                    title: 'Cleared Successfully',
                    text: 'Cart cleared successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: err.message || 'Failed to clear cart',
                    icon: 'error',
                });
            }
        }
    };

    const handleEditItem = (item) => {
        localStorage.setItem('editingCartItem', JSON.stringify(item));
        navigate('/pcb-layout');
    };

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

    const showPaymentModal = async () => {
        const result = await Swal.fire({
            title: 'Select Payment Method',
            icon: 'question',
            html: `
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <div style="
                        padding: 1.5rem;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-align: center;
                    " onclick="document.getElementById('cod').checked=true" class="payment-option">
                        <i style="font-size: 2rem; color: #10304e; display: block; margin-bottom: 0.5rem;" class="fa fa-money-bill"></i>
                        <strong>Cash on Delivery</strong>
                        <p style="font-size: 0.85rem; color: #666; margin: 0.5rem 0 0 0;">Pay when you receive</p>
                    </div>
                    <div style="
                        padding: 1.5rem;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-align: center;
                    " onclick="document.getElementById('razorpay').checked=true" class="payment-option">
                        <i style="font-size: 2rem; color: #fcb535; display: block; margin-bottom: 0.5rem;" class="fa fa-credit-card"></i>
                        <strong>Razorpay</strong>
                        <p style="font-size: 0.85rem; color: #666; margin: 0.5rem 0 0 0;">Pay now with card/UPI</p>
                    </div>
                </div>
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
                    <input type="radio" id="cod" name="payment" value="cod" />
                    <input type="radio" id="razorpay" name="payment" value="razorpay" />
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#10304e',
            didOpen: () => {
                document.getElementById('cod').checked = true;
            },
            preConfirm: () => {
                const selected = document.querySelector('input[name="payment"]:checked');
                return selected ? selected.value : null;
            }
        });

        return result.isConfirmed ? result.value : null;
    };

    const handleCheckout = async () => {
        if (!selectedAddress) {
            Swal.fire({
                title: 'Address Required',
                text: 'Please select a delivery address',
                icon: 'warning',
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        setCheckoutLoading(true);

        try {
            const paymentType = await showPaymentModal();
            if (!paymentType) {
                setCheckoutLoading(false);
                return;
            }

            const API_URL = process.env.REACT_APP_API_URL;
            const orderData = {
                cartItems: cartItems.map(item => ({
                    _id: item._id,
                    cart_id: item.cart_id,
                    pcb_name: item.pcb_name,
                    config: item.config,
                    order_value: item.order_value,
                    tax: item.tax,
                    total_price: item.total_price,
                })),
                shippingAddress: {
                    _id: selectedAddress._id,
                    street: selectedAddress.street,
                    city: selectedAddress.city,
                    district: selectedAddress.district,
                    state: selectedAddress.state,
                    country: selectedAddress.country,
                    pincode: selectedAddress.pincode,
                    companyName: selectedAddress.companyName,
                    gstNo: selectedAddress.gstNo,
                    phone: selectedAddress.phone,
                    location: selectedAddress.location,
                    type: selectedAddress.type,
                },
                cartSummary: cartSummary,
                userProfile: {
                    name: userProfile?.name,
                    email: userProfile?.email,
                    phone: userProfile?.phone,
                    userId: userProfile?.userId,
                },
                paymentType: paymentType,
            };

            console.log('Checkout data:', orderData);
            
            const response = await fetch(`${API_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();
            console.log('Orderplace response:', result);

            if (paymentType === 'cod') {
                if (result.status === 'success' || response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Order Placed Successfully',
                        text: 'Your Cash on Delivery order has been placed successfully!',
                        timer: 2000,
                        showConfirmButton: false,
                    }).then(() => {
                        clearCart(token).then(() => {
                            navigate('/orders');
                        });
                    });
                } else {
                    Swal.fire('Error', result.message || 'COD order failed', 'error');
                }
                setCheckoutLoading(false);
                return;
            }

            if (result.status !== 'success' || !result.data?.razorpayOrder?.id) {
                Swal.fire('Error', result.message || 'Order creation failed', 'error');
                setCheckoutLoading(false);
                return;
            }

            const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;
            const options = {
                key: RAZORPAY_KEY,
                amount: result.data.razorpayOrder.amount,
                currency: 'INR',
                order_id: result.data.razorpayOrder.id,
                name: selectedAddress.companyName || 'Order Payment',
                description: `Order for ${cartSummary.totalItems} items`,
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
                                clearCart(token).then(() => {
                                    navigate('/orders');
                                });
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
                    },
                },
                prefill: { 
                    name: userProfile?.name, 
                    email: userProfile?.email, 
                    contact: userProfile?.phone 
                },
                theme: { color: '#10304e' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

            rzp.on('payment.failed', function (response) {
                Swal.fire('Payment Failed', response.error.description, 'error');
            });

            setCheckoutLoading(false);
        } catch (err) {
            console.error('Checkout error:', err);
            Swal.fire('Error', err.message || 'An error occurred during checkout', 'error');
            setCheckoutLoading(false);
        }
    };

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className="container py-5 text-center">
                    <h3>Please login to view cart</h3>
                    <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
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
                            {/* <h1 className="display-4 text-white mb-4 animated slideInRight">Shopping Cart</h1> */}
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <h5 className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></h5>
                                    <h5 className="breadcrumb-item text-white active">Cart</h5>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="empty-cart">
                            <i className="fa fa-shopping-cart" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                            <h3 className="mt-3">Your cart is empty</h3>
                            <p className="text-muted">Start adding items to your cart</p>
                            <Link to="/pcb-layout" className="btn btn-primary mt-3">
                                <i className="fa fa-plus me-2"></i>Add Items
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="cart-items-container">
                                <div className="cart-header d-flex justify-content-between align-items-center mb-4">
                                    <h3>Cart Items ({cartItems.length})</h3>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={handleClearCart}
                                    >
                                        <i className="fa fa-trash me-2"></i>Clear All
                                    </button>
                                </div>

                                <div className="cart-items">
                                    {cartItems.map((item, idx) => (
                                        <div key={item._id} className="cart-item-card">
                                            <div className="item-number">{idx + 1}</div>

                                            <div className="item-details">
                                                <div className="item-header">
                                                    <h5 className="item-title">{item.pcb_name}</h5>
                                                    <span className="service-badge">{item.service_code}</span>
                                                </div>

                                                <div className="item-specs">
                                                    <div className="spec-row">
                                                        <span className="spec-label">Layers:</span>
                                                        <span className="spec-value">{item.config?.layers}</span>
                                                    </div>
                                                    <div className="spec-row">
                                                        <span className="spec-label">Components:</span>
                                                        <span className="spec-value">{item.config?.components}</span>
                                                    </div>
                                                    <div className="spec-row">
                                                        <span className="spec-label">Dimensions:</span>
                                                        <span className="spec-value">
                                                            {item.config?.dimension_x} x {item.config?.dimension_y} mm
                                                        </span>
                                                    </div>
                                                    <div className="spec-row">
                                                        <span className="spec-label">Lead Time:</span>
                                                        <span className="spec-value">{item.lead_time} WD</span>
                                                    </div>
                                                    {item.config?.controlled_impedance && (
                                                        <div className="spec-row">
                                                            <span className="spec-label">Impedance: </span>
                                                            <span className="spec-value badge bg-info"> Controlled</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {item.files && (Object.keys(item.files).length > 0) && (
                                                    <div className="item-files mt-2">
                                                        {item.files.schematic && (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleViewFile(item.files.schematic.path, getFileType(item.files.schematic.mimetype))}
                                                                title="View schematic"
                                                            >
                                                                <i className="fa fa-image me-1"></i>View Schematic
                                                            </button>
                                                        )}
                                                        {item.files.bom && (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleViewFile(item.files.bom.path, getFileType(item.files.bom.mimetype))}
                                                                title="View BOM"
                                                            >
                                                                <i className="fa fa-file-pdf me-1"></i>View BOM
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="item-files mt-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEditItem(item)}
                                                        title="Edit item"
                                                    >
                                                        <i className="fa fa-pen me-1"></i>Update
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleRemoveItem(item.cart_id)}
                                                        title="Remove item"
                                                    >
                                                        <i className="fa fa-trash me-1"></i>Delete
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="item-pricing">
                                                <div className="price-section">
                                                    <div className="price-row">
                                                        <span>Order Value:</span>
                                                        <span className="fw-bold">₹ {item.order_value?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="price-row">
                                                        <span>Tax (18%):</span>
                                                        <span className="fw-bold">₹ {item.tax?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="price-row total-row">
                                                        <span>Total:</span>
                                                        <span className="text-success fw-bold" style={{ fontSize: '1.1rem' }}>
                                                            ₹ {item.total_price?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="cart-sidebar">
                                <div className="order-summary card">
                                    <h4 className="summary-title">Order Summary</h4>

                                    <div className="summary-row">
                                        <span>Total Items:</span>
                                        <span className="fw-bold" style={{ color: '#10304e', fontSize: '1.2rem' }}>
                                            {cartSummary.totalItems}
                                        </span>
                                    </div>

                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span className="fw-bold">
                                            ₹ {(cartSummary.totalValue - (cartSummary.totalValue * 0.18))?.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="summary-row">
                                        <span>Tax (18%):</span>
                                        <span className="fw-bold">
                                            ₹ {Math.round(cartSummary.totalValue * 0.18 / 1.18)?.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="summary-row total-summary">
                                        <span>Total Amount:</span>
                                        <span className="total-amount">
                                            ₹ {cartSummary.totalValue?.toLocaleString()}
                                        </span>
                                    </div>

                                    <button 
                                        className="btn btn-checkout w-100 mt-4" 
                                        onClick={handleCheckout}
                                        disabled={checkoutLoading}
                                    >
                                        {checkoutLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-credit-card me-2"></i>Proceed to Checkout
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* <div className="shipment-info card mt-4">
                                    <h5 className="info-title">Shipment Details</h5>
                                    <div className="info-item">
                                        <span className="label">Expected Delivery:</span>
                                        <span className="value">
                                            {cartItems[0]?.shipment_date || 'TBD'}
                                        </span>
                                    </div>
                                </div> */}

                                <CartShipmentAddress 
                                    selectedAddress={selectedAddress}
                                    onAddressSelect={setSelectedAddress}
                                    onAddressAdded={fetchUserAddresses}
                                    userProfile={userProfile}
                                />

                                <Link to="/pcb-layout" className="btn btn-add-more w-100 mt-3">
                                    <i className="fa fa-plus-circle me-2"></i>Add More Items
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
            
            {viewingFile && (
                <FileViewer 
                    file={viewingFile} 
                    type={fileType} 
                    onClose={handleCloseViewer}
                />
            )}
        </div>
    );
};

export default Cart;
