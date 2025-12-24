import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';

const QuotationList = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [statusFilter, setStatusFilter] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchQuotations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, statusFilter, itemsPerPage, user, token]);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: itemsPerPage.toString(),
                ...(statusFilter && { status: statusFilter })
            });

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/quotations/list?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setQuotations(data.data?.quotations || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.data?.pagination?.total || 0,
                    totalPages: data.data?.pagination?.totalPages || 0
                }));
            } else {
                throw new Error(data.message || 'Failed to fetch quotations');
            }
        } catch (err) {
            console.error('Error fetching quotations:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'Failed to load quotations',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleItemsPerPageChange = (newLimit) => {
        setItemsPerPage(newLimit);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getStatusBadge = (quotation) => {

        const statusConfig = {
            pending: { class: 'bg-warning', label: 'Pending' },
            quoted: { class: 'bg-info', label: 'Quoted' },
            accepted: { class: 'bg-success', label: 'Accepted' },
            requote_requested: { class: 'bg-primary', label: 'Requote Requested' },
            rejected: { class: 'bg-danger', label: 'Rejected' },
            cancelled: { class: 'bg-secondary', label: 'Cancelled' }
        };
        const config = statusConfig[quotation.status] || { class: 'bg-secondary', label: quotation.status };
        return <span className={`badge ${config.class}`}>{config.label}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                                    <h5 className="breadcrumb-item text-white active">My Quotations</h5>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                <div className="row mb-4">
                    <div className="col-md-8">
                        <h3>My Quotation Requests</h3>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="quoted">Quoted</option>
                            <option value="accepted">Accepted</option>
                            <option value="requote_requested">Requote Requested</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : quotations.length === 0 ? (
                    <div className="alert alert-info text-center">
                        <i className="fa fa-info-circle me-2"></i>
                        No quotation requests found. <Link to="/pcb-layout">Request a quotation</Link>
                    </div>
                ) : (
                    <>
                        <div className="pcb-layout-container">
                            <div className="pcb-layout-form">
                                <div className="table-responsive ">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-center">Quotation ID</th>
                                                <th className="text-center">Service Name</th>
                                                <th className="text-center">PCB Name</th>
                                                <th className="text-center">Quotation Status</th>
                                                <th className="text-center">Payment Status</th>
                                                <th className="text-center">Quoted Amount</th>
                                                <th className="text-center">Created Date</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quotations.map((quotation) => (
                                                <tr key={quotation.quotation_id}>
                                                    <td className="text-center">
                                                        <small className="text-muted">{quotation.quotation_id}</small>
                                                    </td>
                                                    <td className="text-center">{quotation.service_name}</td>
                                                    <td className="text-center">{quotation.pcb_name || '-'}</td>
                                                    <td className="text-center">{getStatusBadge(quotation)}</td>
                                                    <td className="text-center">
                                                        {quotation.ispayment === true ? (
                                                            <span className="badge bg-success">Payment Success</span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="text-center">
                                                        {quotation.quoted_amount
                                                            ? `₹${quotation.quoted_amount.toLocaleString()}`
                                                            : '-'}
                                                    </td>
                                                    <td className="text-center">{formatDate(quotation.createdAt)}</td>
                                                    <td className="text-center">
                                                        <button
                                                            onClick={() => navigate(`/quotations/${quotation.quotation_id}`, { state: { quotation } })}
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            <i className="fa fa-eye me-1"></i>
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {pagination.total > 0 && (
                                    <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
                                        <div className="text-muted">
                                            Showing {((pagination.page - 1) * itemsPerPage) + 1} to {Math.min(pagination.page * itemsPerPage, pagination.total)} of {pagination.total} Quotations
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
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                </select>
                                                <span className="text-muted">per page</span>
                                            </div>

                                            {pagination.totalPages > 1 && (
                                                <nav>
                                                    <ul className="pagination mb-0">
                                                        <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                                disabled={pagination.page === 1}
                                                            >
                                                                <i className="fa fa-chevron-left"></i>
                                                            </button>
                                                        </li>

                                                        {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                                                            let pageNum;
                                                            if (pagination.totalPages <= 5) {
                                                                pageNum = index + 1;
                                                            } else if (pagination.page <= 3) {
                                                                pageNum = index + 1;
                                                            } else if (pagination.page >= pagination.totalPages - 2) {
                                                                pageNum = pagination.totalPages - 4 + index;
                                                            } else {
                                                                pageNum = pagination.page - 2 + index;
                                                            }

                                                            return (
                                                                <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                                                    <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                                                                        {pageNum}
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}

                                                        <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                                disabled={pagination.page === pagination.totalPages}
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
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default QuotationList;
