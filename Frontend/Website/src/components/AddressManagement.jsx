import { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { useAddresses } from '../hooks/useAddresses';
import '../assets/css/AddressManagement.css';

const ADDRESSES_PER_PAGE = 5;

const AddressManagement = ({ addresses: initialAddresses, onAddressChange }) => {
    const { addresses, addAddress, updateAddress, deleteAddress, isLoading } = useAddresses();
    const formRef = useRef(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [initialFormData, setInitialFormData] = useState({
        type: ['delivery'],
        street: '',
        city: '',
        location: '',
        district: '',
        state: '',
        country: 'India',
        pincode: '',
        phone: '',
        companyName: '',
        gstNo: '',
    });
    const [formData, setFormData] = useState({
        type: ['delivery'],
        street: '',
        city: '',
        location: '',
        district: '',
        state: '',
        country: 'India',
        pincode: '',
        phone: '',
        companyName: '',
        gstNo: '',
    });

    const handleChange = (e) => {
        const { id, value, checked, type } = e.target;
        let updatedFormData = { ...formData };

        if (type === 'checkbox') {
            if (checked) {
                updatedFormData = {
                    ...formData,
                    type: [...(formData.type || []), id],
                };
            } else {
                updatedFormData = {
                    ...formData,
                    type: (formData.type || []).filter(t => t !== id),
                };
            }
        } else if (id === 'pincode') {
            const pinValue = value.replace(/\D/g, '').slice(0, 6);
            updatedFormData = {
                ...formData,
                [id]: pinValue,
            };
        } else if (id === 'phone') {
            const phoneValue = value.replace(/\D/g, '').slice(0, 10);
            updatedFormData = {
                ...formData,
                [id]: phoneValue,
            };
        } else {
            updatedFormData = {
                ...formData,
                [id]: value,
            };
        }

        setFormData(updatedFormData);
        const hasChanges = JSON.stringify(updatedFormData) !== JSON.stringify(initialFormData);
        setIsFormDirty(hasChanges);
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingId(null);
        setIsFormDirty(false);
    };

    const handleSaveAddress = async () => {
        if (!formData.street || !formData.city || !formData.district || !formData.state || !formData.pincode || !formData.phone || !formData.gstNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all required fields',
                timer: 3000,
                timerProgressBar: true,
            });
            return;
        }

        if (formData.pincode.length !== 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Pincode',
                text: 'Pincode must be exactly 6 digits',
                timer: 3000,
                timerProgressBar: true,
            });
            return;
        }

        if (formData.phone.length !== 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Phone',
                text: 'Phone number must be exactly 10 digits',
                timer: 3000,
                timerProgressBar: true,
            });
            return;
        }

        try {
            if (editingId) {
                await updateAddress(editingId, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Address Updated',
                    text: 'Address has been updated successfully',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            } else {
                await addAddress(formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Address Added',
                    text: 'New address has been added successfully',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            }
            setShowAddForm(false);
            setIsFormDirty(false);
            resetForm();
            if (onAddressChange) {
                await onAddressChange();
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: err.message || 'Failed to save address',
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    const handleEditAddress = (address) => {
        const addressData = {
            type: Array.isArray(address.type) ? address.type : [address.type],
            street: address.street || '',
            city: address.city || '',
            location: address.location || '',
            district: address.district || '',
            state: address.state || '',
            country: address.country || 'India',
            pincode: address.pincode || '',
            phone: address.phone || '',
            companyName: address.companyName || '',
            gstNo: address.gstNo || '',
        };
        setInitialFormData(addressData);
        setFormData(addressData);
        setIsFormDirty(false);
        setEditingId(address._id);
        setShowAddForm(true);
        
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 0);
    };

    const handleDeleteAddress = async (addressId) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete Address',
            text: 'Are you sure you want to delete this address?',
            showCancelButton: true,
            confirmButtonColor: '#d9534f',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                await deleteAddress(addressId);
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    text: 'Address has been deleted successfully',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
                if (onAddressChange) {
                    await onAddressChange();
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: err.message || 'Failed to delete address',
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        }
    };

    const displayAddresses = initialAddresses || addresses;
    const totalPages = Math.ceil((displayAddresses?.length || 0) / ADDRESSES_PER_PAGE);
    const startIndex = (currentPage - 1) * ADDRESSES_PER_PAGE;
    const endIndex = startIndex + ADDRESSES_PER_PAGE;
    const paginatedAddresses = displayAddresses?.slice(startIndex, endIndex) || [];

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <div className="address-management-section">
            <div className="section-header">
                <h2>Address Management</h2>
                {!showAddForm && (
                    <button
                        className="btn-add-address"
                        onClick={() => {
                            resetForm();
                            setShowAddForm(true);
                        }}
                    >
                        <i className="fa fa-plus"></i> Add Address
                    </button>
                )}
            </div>

            {showAddForm && (
                <div ref={formRef} className="address-form-card">
                    <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>

                    <div className="form-group-row">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                id="delivery"
                                checked={(formData.type || []).includes('delivery')}
                                onChange={handleChange}
                            />
                            <span>Delivery Address</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                id="invoice"
                                checked={(formData.type || []).includes('invoice')}
                                onChange={handleChange}
                            />
                            <span>Invoice Address</span>
                        </label>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="companyName">Company Name</label>
                            <input
                                type="text"
                                id="companyName"
                                className="form-control"
                                placeholder="Enter company name"
                                value={formData.companyName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                            <input
                                type="tel"
                                id="phone"
                                className="form-control"
                                placeholder="Enter 10-digit phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength="10"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="street">Street Address <span className="required">*</span></label>
                        <input
                            type="text"
                            id="street"
                            className="form-control"
                            placeholder="Enter street address"
                            value={formData.street}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City <span className="required">*</span></label>
                            <input
                                type="text"
                                id="city"
                                className="form-control"
                                placeholder="Enter city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="district">District <span className="required">*</span></label>
                            <input
                                type="text"
                                id="district"
                                className="form-control"
                                placeholder="Enter district"
                                value={formData.district}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="state">State <span className="required">*</span></label>
                            <input
                                type="text"
                                id="state"
                                className="form-control"
                                placeholder="Enter state"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pincode">Pincode <span className="required">*</span></label>
                            <input
                                type="tel"
                                id="pincode"
                                className="form-control"
                                placeholder="Enter 6-digit pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                maxLength="6"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="location">Location/Landmark</label>
                            <input
                                type="text"
                                id="location"
                                className="form-control"
                                placeholder="Enter location or landmark (optional)"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="gstNo">GST Number <span className="required">*</span></label>
                            <input
                                type="text"
                                id="gstNo"
                                className="form-control"
                                placeholder="Enter GST number"
                                value={formData.gstNo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn-cancel"
                            onClick={() => {
                                setShowAddForm(false);
                                setIsFormDirty(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-save"
                            onClick={handleSaveAddress}
                            disabled={!isFormDirty || isLoading}
                        >
                            <i className="fa fa-check"></i> {isLoading ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </div>
            )}

            <div className="addresses-grid">
                {paginatedAddresses && paginatedAddresses.length > 0 ? (
                    paginatedAddresses.map((address) => (
                        <div key={address._id} className="address-card">
                            <div className="address-header">
                                <h4>{address.companyName || 'Address'}</h4>
                                <div className="address-types">
                                    {Array.isArray(address.type) ? (
                                        address.type.map((t) => (
                                            <span key={t} className={`badge badge-${t}`}>
                                                {t === 'delivery' ? 'Delivery' : 'Invoice'}
                                            </span>
                                        ))
                                    ) : address.type ? (
                                        <span className={`badge badge-${address.type}`}>
                                            {address.type === 'delivery' ? 'Delivery' : 'Invoice'}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="address-details">
                                {address.phone && (
                                    <p>
                                        <i className="fa fa-phone"></i> {address.phone}
                                    </p>
                                )}
                                <p>
                                    <i className="fa fa-map-marker-alt"></i> {address.street}
                                </p>
                                <p>
                                    <i className="fa fa-building"></i> {address.city}, {address.district}
                                </p>
                                <p>
                                    <i className="fa fa-map"></i> {address.state} - {address.pincode}
                                </p>
                                {address.location && (
                                    <p>
                                        <i className="fa fa-info-circle"></i> {address.location}
                                    </p>
                                )}
                                {address.gstNo && (
                                    <p>
                                        <i className="fa fa-file"></i> <strong>GST:</strong> {address.gstNo}
                                    </p>
                                )}
                            </div>

                            <div className="address-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => handleEditAddress(address)}
                                >
                                    <i className="fa fa-edit"></i> Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteAddress(address._id)}
                                >
                                    <i className="fa fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-addresses">
                        <i className="fa fa-map-marker-alt"></i>
                        <p>No addresses added yet</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <i className="fa fa-chevron-left"></i> Previous
                    </button>
                    
                    <span style={{ margin: '0 15px', fontWeight: '500' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next <i className="fa fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddressManagement;
