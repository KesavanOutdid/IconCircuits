import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Orders.css';
import { Link } from 'react-router-dom';

const Orders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { orders, pagination, isLoading, fetchOrders, cancelOrder } = useOrders();
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders(currentPage, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, currentPage, itemsPerPage, navigate]);

    const handleItemsPerPageChange = (newLimit) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

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

    const getPendingTimeInfo = (createdAt) => {
        const orderDate = new Date(createdAt);
        const now = new Date();
        const diffInHours = Math.floor((now - orderDate) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} pending`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} pending`;
        } else {
            const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} pending`;
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => {
            if (filterStatus === 'success') return order.paymentStatus === 'completed' && order.orderStatus !== 'cancelled';
            if (filterStatus === 'pending') return order.paymentStatus === 'pending' && order.orderStatus !== 'cancelled';
            if (filterStatus === 'failed') return order.paymentStatus === 'failed' || order.orderStatus === 'cancelled';
            return true;
        });

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
        pending: orders.filter(o => o.paymentStatus === 'pending' && o.orderStatus !== 'cancelled').length,
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
                fetchOrders(currentPage, itemsPerPage);
            } catch (err) {
                Swal.fire('Error', err.message || 'Failed to cancel order', 'error');
            }
        }
    };

    const renderConfigDetails = (config) => {
        if (!config) return null;
        
        const configEntries = Object.entries(config).filter(([key, value]) => {
            return value !== null && value !== undefined && value !== '' && 
                   !(Array.isArray(value) && value.length === 0);
        });

        if (configEntries.length === 0) return null;

        return (
            <div className="config-details-full mt-3 p-3 bg-light rounded" style={{margin:'15px'}}>
                <h6 className="mb-3 text-primary">
                    <i className="fa fa-cog me-2"></i>
                    Configuration Details
                </h6>
                <div className="row g-3">
                    {configEntries.map(([key, value]) => {
                        const formattedKey = key
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        
                        let displayValue = value;
                        if (Array.isArray(value)) {
                            displayValue = value.join(', ');
                        } else if (typeof value === 'boolean') {
                            displayValue = value ? 'Yes' : 'No';
                        }

                        return (
                            <div key={key} className="col-12 col-md-4">
                                <div className="d-flex align-items-start">
                                    <i className="fa fa-check-circle text-success me-2 mt-1"></i>
                                    <div>
                                        <strong className="text-dark">{formattedKey}:</strong>
                                        <div className="text-muted small">{displayValue}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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

            <div className="container-fluid bg-primary hero-header" style={{ height: '15vh' }}>
                <div className="container pt-4">
                    <div className="row g-5 pt-5">
                        <div className="col-lg-12 text-center">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <h5 className="breadcrumb-item"><Link className="text-white" to="/">Home</Link></h5>
                                    <h5 className="breadcrumb-item text-white active" aria-current="page">Orders</h5>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                
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
                            backgroundColor: filterStatus === 'failed' ? '#dc3545' : '#e9ecef',
                            color: filterStatus === 'failed' ? '#fff' : '#000'
                        }}
                        onClick={() => handleFilterChange('failed')}
                    >
                        <i className="fa fa-times-circle me-2"></i>Cancelled ({orderStats.cancelled})
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <i className="fa fa-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                        <h3 className="mt-3">No Orders Found</h3>
                        <p className="text-muted">You haven't placed any orders yet</p>
                        <a href="/pcb-layout" className="btn btn-primary mt-3">
                            <i className="fa fa-plus me-2"></i>Request Quotation
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="orders-list">
                            {filteredOrders.map((order) => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-info">
                                            <h5 className="order-id">Order #{order.orderId.slice(4, 12).toUpperCase()}</h5>
                                            <p className="order-date">
                                                <i className="fa fa-calendar me-2"></i>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
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
                                            <span className="summary-label">Service</span>
                                            <span className="summary-value" style={{ paddingLeft: '10px' }}>{order.serviceName || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Total Amount</span>
                                            <span className="summary-value amount" style={{paddingLeft:'10px'}}> ₹ {order.amount?.toLocaleString() || '0'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Payment Method</span>
                                            <span className={`payment-badge ${order.paymentType}`} style={{ paddingLeft: '10px' }}>
                                                <i className={`fa ${order.paymentType === 'razorpay' ? 'fa-credit-card' : 'fa-money-bill'}`}></i>
                                                {getPaymentMethodBadge(order.paymentType)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-details-section px-3 py-2">
                                        <div className="mb-2">
                                            <strong className="text-primary">
                                                <i className="fa fa-microchip me-2"></i>
                                                {order.pcbName || order.serviceName}
                                            </strong>
                                            {order.serviceCode && (
                                                <span className="badge bg-secondary ms-2">{order.serviceCode}</span>
                                            )}
                                        </div>
                                        
                                        <div className="row g-2 small text-muted mb-2">
                                            {order.config?.layers && (
                                                <div className="col-6 col-md-4">
                                                    <i className="fa fa-layer-group me-1"></i>
                                                    <strong>Layers:</strong> {order.config.layers}
                                                </div>
                                            )}
                                            {order.config?.pcb_type && (
                                                <div className="col-6 col-md-4">
                                                    <i className="fa fa-microchip me-1"></i>
                                                    <strong>Type:</strong> {order.config.pcb_type}
                                                </div>
                                            )}
                                            {order.config?.lead_time && (
                                                <div className="col-6 col-md-4">
                                                    <i className="fa fa-clock me-1"></i>
                                                    <strong>Lead Time:</strong> {order.config.lead_time} Working days
                                                </div>
                                            )}
                                        </div>

                                        {order.quotationId && (
                                            <div className="small text-muted mb-2">
                                                <i className="fa fa-file-text me-1"></i>
                                                <strong>Quotation ID:</strong> <span className="text-primary">{order.quotationId}</span>
                                            </div>
                                        )}

                                        {/* {order.paymentType === 'razorpay' && order.razorpayPaymentId && (
                                            <div className="small text-muted">
                                                <i className="fa fa-shield me-1"></i>
                                                <strong>Payment ID:</strong> <span className="text-success">{order.razorpayPaymentId}</span>
                                            </div>
                                        )} */}
                                    </div>

                                    {expandedOrderId === order._id && renderConfigDetails(order.config)}

                                    <div className="order-footer">
                                        <div className="footer-left">
                                            {order.paymentStatus === 'pending' && order.orderStatus !== 'cancelled' && (
                                                <span className="pending-time">
                                                    <i className="fa fa-hourglass-half me-2"></i>
                                                    {getPendingTimeInfo(order.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="footer-right">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => toggleOrderDetails(order._id)}
                                            >
                                                <i className={`fa fa-${expandedOrderId === order._id ? 'chevron-up' : 'chevron-down'} me-1`}></i>
                                                {expandedOrderId === order._id ? 'Hide Details' : 'View Full Details'}
                                            </button>
                                            {order.paymentStatus === 'pending' && order.orderStatus !== 'cancelled' && (
                                                <button
                                                    className="btn-cancel"
                                                    onClick={() => handleCancelOrder(order.orderId)}
                                                >
                                                    <i className="fa fa-times me-2"></i>Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pagination.totalPages > 0 && (
                            <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
                                <div className="text-muted">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} Orders
                                </div>
                                
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="text-muted">Show:</span>
                                        <select 
                                            className="form-select form-select-sm" 
                                            style={{ width: '80px' }}
                                            value={itemsPerPage}
                                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                        >
                                            <option value={3}>3</option>
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                        </select>
                                        <span className="text-muted">per page</span>
                                    </div>

                                    {pagination.totalPages > 1 && (
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <i className="fa fa-chevron-left"></i>
                                                    </button>
                                                </li>
                                                
                                                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                                                    let pageNum;
                                                    if (pagination.totalPages <= 5) {
                                                        pageNum = index + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = index + 1;
                                                    } else if (currentPage >= pagination.totalPages - 2) {
                                                        pageNum = pagination.totalPages - 4 + index;
                                                    } else {
                                                        pageNum = currentPage - 2 + index;
                                                    }
                                                    
                                                    return (
                                                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                            <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                                                                {pageNum}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                                
                                                <li className={`page-item ${currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === pagination.totalPages}
                                                    >
                                                        <i className="fa fa-chevron-right"></i>
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Orders;
