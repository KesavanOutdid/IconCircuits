import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { orders, isLoading, fetchOrders, cancelOrder } = useOrders();
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, fetchOrders, navigate]);

    const getStatusBadgeClass = (paymentStatus, orderStatus) => {
        if (orderStatus === 'cancelled') return 'status-cancelled';
        if (paymentStatus === 'completed') return 'status-completed';
        if (paymentStatus === 'pending') return 'status-pending';
        return 'status-failed';
    };

    const getStatusBadgeText = (paymentStatus, orderStatus) => {
        if (orderStatus === 'cancelled') return 'Cancelled';
        if (paymentStatus === 'completed') return 'Success';
        if (paymentStatus === 'pending') return 'Pending';
        return 'Failed';
    };

    const getPaymentMethodBadge = (paymentType) => {
        return paymentType === 'razorpay' ? 'Razorpay' : 'Cash on Delivery';
    };

    const allFilteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => {
            if (filterStatus === 'success') return order.paymentStatus === 'completed' && order.orderStatus !== 'cancelled';
            if (filterStatus === 'pending') return order.paymentStatus === 'pending';
            if (filterStatus === 'failed') return order.paymentStatus === 'failed' || order.orderStatus === 'cancelled';
            return true;
        });

    const totalPages = Math.ceil(allFilteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = allFilteredOrders.slice(startIndex, endIndex);

    const handleFilterChange = (newStatus) => {
        setFilterStatus(newStatus);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const orderStats = {
        total: orders.length,
        success: orders.filter(o => o.paymentStatus === 'completed' && o.orderStatus !== 'cancelled').length,
        pending: orders.filter(o => o.paymentStatus === 'pending').length,
        cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
    };

    const handleCancelOrder = async (orderId) => {
        const result = await Swal.fire({
            title: 'Cancel Order?',
            text: 'Are you sure you want to cancel this order?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Cancel Order',
            cancelButtonText: 'No, Keep It',
            confirmButtonColor: '#10304e',
        });

        if (result.isConfirmed) {
            try {
                await cancelOrder(orderId, 'User requested cancellation');
                Swal.fire({
                    icon: 'success',
                    title: 'Order Cancelled',
                    text: 'Your order has been cancelled successfully',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (err) {
                Swal.fire('Error', err.message || 'Failed to cancel order', 'error');
            }
        }
    };

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className="container py-5 text-center">
                    <h3>Please login to view orders</h3>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            <div className="container-fluid pt-5 bg-primary hero-header" style={{ height: '20vh' }}>
                <div className="container pt-5">
                    <div className="row g-5 pt-3">
                        <div className="col-lg-12 text-center">
                            <h1 className="display-4 text-white mb-4 animated slideInRight">My Orders</h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <li className="breadcrumb-item"><a href="/" className="text-white">Home</a></li>
                                    <li className="breadcrumb-item text-white active">Orders</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                
                {/* Filter Buttons */}
                <div className="filter-section mb-4">
                    <button
                        className="filter-btn"
                        style={{
                            backgroundColor: filterStatus === 'all' ? '#10304e' : '#e9ecef',
                            color: filterStatus === 'all' ? '#fff' : '#000'
                        }}
                        onClick={() => handleFilterChange('all')}
                    >
                        <i className="fa fa-shopping-bag me-2"></i>All Orders ({orderStats.total})
                    </button>

                    <button
                        className="filter-btn"
                        style={{
                            backgroundColor: filterStatus === 'success' ? '#28a745' : '#e9ecef',
                            color: filterStatus === 'success' ? '#fff' : '#000'
                        }}
                        onClick={() => handleFilterChange('success')}
                    >
                        <i className="fa fa-check-circle me-2"></i>Success ({orderStats.success})
                    </button>

                    <button
                        className="filter-btn"
                        style={{
                            backgroundColor: filterStatus === 'pending' ? '#fcb535' : '#e9ecef',
                            color: filterStatus === 'pending' ? '#000' : '#000'
                        }}
                        onClick={() => handleFilterChange('pending')}
                    >
                        <i className="fa fa-hourglass-half me-2"></i>Pending ({orderStats.pending})
                    </button>

                    <button
                        className="filter-btn"
                        style={{
                            backgroundColor: filterStatus === 'failed' ? '#dc3545' : '#e9ecef',
                            color: filterStatus === 'failed' ? '#fff' : '#000'
                        }}
                        onClick={() => handleFilterChange('failed')}
                    >
                        <i className="fa fa-times-circle me-2"></i>Cancelled ({orderStats.cancelled})
                    </button>
                </div>

                {/* Orders List */}
                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : allFilteredOrders.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <i className="fa fa-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                        <h3 className="mt-3">No Orders Found</h3>
                        <p className="text-muted">You haven't placed any orders yet</p>
                        <a href="/pcb-layout" className="btn btn-primary mt-3">
                            <i className="fa fa-plus me-2"></i>Start Shopping
                        </a>
                    </div>
                ) : (
                    <div className="orders-list">
                        {paginatedOrders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <h5 className="order-id">Order #{order.orderId.slice(0, 8).toUpperCase()}</h5>
                                        <p className="order-date">
                                            <i className="fa fa-calendar me-2"></i>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="order-status">
                                        <span className={`status-badge ${getStatusBadgeClass(order.paymentStatus, order.orderStatus)}`}>
                                            {getStatusBadgeText(order.paymentStatus, order.orderStatus)}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-summary">
                                    <div className="summary-item">
                                        <span className="summary-label">Items</span>
                                        <span className="summary-value">{order.cartItems.length}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Total Amount</span>
                                        <span className="summary-value amount">₹ {order.cartSummary.totalValue.toLocaleString()}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Payment Method</span>
                                        <span className={`payment-badge ${order.paymentType}`}>
                                            <i className={`fa ${order.paymentType === 'razorpay' ? 'fa-credit-card' : 'fa-money-bill'}`}></i>
                                            {getPaymentMethodBadge(order.paymentType)}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-address">
                                    <h6>Delivery Address</h6>
                                    <p>
                                        {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                                        {order.shippingAddress.district}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                                    </p>
                                </div>

                                <div className="order-footer">
                                    <button
                                        className="btn-expand"
                                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                    >
                                        <i className={`fa fa-chevron-${expandedOrderId === order._id ? 'up' : 'down'}`}></i>
                                        {expandedOrderId === order._id ? 'Hide' : 'View'} Details
                                    </button>
                                    {(order.paymentStatus === 'pending' || order.orderStatus === 'created') && (
                                        <button
                                            className="btn-cancel"
                                            onClick={() => handleCancelOrder(order.orderId)}
                                        >
                                            <i className="fa fa-times me-2"></i>Cancel Order
                                        </button>
                                    )}
                                </div>

                                {expandedOrderId === order._id && (
                                    <div className="order-details">
                                        <div className="details-header">
                                            <h6>Order Items</h6>
                                        </div>
                                        {order.cartItems.map((item, idx) => (
                                            <div key={idx} className="detail-item">
                                                <div className="item-name-section">
                                                    <span className="item-number">{idx + 1}</span>
                                                    <div className="item-name-detail">
                                                        <h6>{item.pcb_name}</h6>
                                                        <small className="text-muted">{item.service_code}</small>
                                                    </div>
                                                </div>
                                                <div className="item-specs-inline">
                                                    {item.config?.layers && <span className="spec-inline">{item.config.layers}L</span>}
                                                    {item.config?.dimension_x && <span className="spec-inline">{item.config.dimension_x}x{item.config.dimension_y}mm</span>}
                                                </div>
                                                <div className="item-price">
                                                    <p className="text-muted mb-1">₹ {item.order_value?.toLocaleString()}</p>
                                                    <strong>₹ {item.total_price?.toLocaleString()}</strong>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="details-footer">
                                            <div className="total-calculation">
                                                <div className="calc-row">
                                                    <span>Subtotal:</span>
                                                    <span>₹ {order.cartSummary.subtotal?.toLocaleString() || (order.cartSummary.totalValue - (order.cartSummary.totalValue * 0.18)).toLocaleString()}</span>
                                                </div>
                                                <div className="calc-row">
                                                    <span>Tax (18%):</span>
                                                    <span>₹ {(order.cartSummary.totalValue * 0.18).toLocaleString()}</span>
                                                </div>
                                                <div className="calc-row total">
                                                    <span>Total:</span>
                                                    <span>₹ {order.cartSummary.totalValue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-4">
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-center">
                                        {/* Previous Button */}
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <i className="fa fa-chevron-left me-2"></i>Previous
                                            </button>
                                        </li>

                                        {/* Page Numbers */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            </li>
                                        ))}

                                        {/* Next Button */}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <i className="fa fa-chevron-right ms-2"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                                <div className="pagination-info text-center mt-2">
                                    <small className="text-muted">
                                        Showing {startIndex + 1} to {Math.min(endIndex, allFilteredOrders.length)} of {allFilteredOrders.length} orders
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Orders;
