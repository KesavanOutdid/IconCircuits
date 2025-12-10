import React, { useState, useMemo } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import Swal from 'sweetalert2';
import '../assets/css/CartShipmentAddress.css';

const CartShipmentAddress = ({ selectedAddress, onAddressSelect, onAddressAdded, userProfile }) => {
    const { isLoading, addAddress } = useAddresses();

    const addresses = useMemo(() => {
        return userProfile?.addresses || [];
    }, [userProfile?.addresses]);

    const [showAddForm, setShowAddForm] = useState(false);
    
    // useEffect(() => {
    //     console.log('CartShipmentAddress - addresses:', addresses);
    //     console.log('CartShipmentAddress - addresses length:', addresses?.length);
    //     console.log('CartShipmentAddress - selectedAddress:', selectedAddress);
    // }, [addresses, selectedAddress]);

    const [isFormDirty, setIsFormDirty] = useState(false);
    const initialFormData = {
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
    };
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
        setIsFormDirty(false);
    };

    const handleSaveAddress = async () => {
        if (!formData.street || !formData.city || !formData.district || !formData.state || !formData.pincode || !formData.phone || !formData.location || !formData.gstNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all required fields',
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        if (formData.pincode.length !== 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Pincode',
                text: 'Pincode must be exactly 6 digits',
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        if (formData.phone.length !== 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Phone',
                text: 'Phone number must be exactly 10 digits',
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        try {
            await addAddress(formData);
            Swal.fire({
                icon: 'success',
                title: 'Address Added',
                text: 'New address has been added successfully',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            setShowAddForm(false);
            resetForm();
            if (onAddressAdded) {
                onAddressAdded();
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: err.message || 'Failed to save address',
                timer: 2000,
                timerProgressBar: true,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="shipment-address-container card">
                <h5 className="info-title">
                    <i className="fa fa-map-marker-alt"></i> Shipment Address
                </h5>
                <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shipment-address-container card">
            {/* {userProfile && (
                <div className="user-info-section">
                    <div className="user-info-header">
                        <div className="user-avatar">
                            <i className="fa fa-user-circle"></i>
                        </div>
                        <div className="user-details">
                            <h6 className="user-name">{userProfile.name}</h6>
                            <p className="user-email">{userProfile.email}</p>
                            {userProfile.phone && (
                                <p className="user-phone">
                                    <i className="fa fa-phone"></i> {userProfile.phone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )} */}

            <div className="shipment-address-header">
                <h5 className="info-title">
                    <i className="fa fa-map-marker-alt"></i> Shipment Address
                </h5>
                {!showAddForm && (
                    <button
                        className="btn-add-shipment-addr"
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
                <div className="address-form-card-cart">
                    <h6>Add New Shipping Address</h6>

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

                    <div className="form-row-cart">
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
                            <label htmlFor="phone">Phone <span className="required">*</span></label>
                            <input
                                type="tel"
                                id="phone"
                                className="form-control"
                                placeholder="10-digit number"
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

                    <div className="form-row-cart">
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

                    <div className="form-row-cart">
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
                                placeholder="6-digit pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                maxLength="6"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location/Landmark <span className="required">*</span></label>
                        <input
                            type="text"
                            id="location"
                            className="form-control"
                            placeholder="Enter location or landmark"
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

                    <div className="form-actions-cart">
                        <button
                            className="btn-cancel"
                            onClick={() => {
                                setShowAddForm(false);
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
                            <i className="fa fa-check"></i> Save Address
                        </button>
                    </div>
                </div>
            )}

            <div className="addresses-list-cart">
                {addresses && addresses.length > 0 ? (
                    addresses.map((address, idx) => (
                        <div
                            key={address._id}
                            className={`address-item-cart ${selectedAddress?._id === address._id ? 'selected' : ''}`}
                            onClick={() => onAddressSelect(address)}
                        >
                            <div className="address-radio">
                                <input
                                    type="radio"
                                    id={`address-${address._id}`}
                                    name="shipment-address"
                                    checked={selectedAddress?._id === address._id}
                                    onChange={() => onAddressSelect(address)}
                                />
                                <label htmlFor={`address-${address._id}`}></label>
                            </div>
                            <div className="address-content-cart">
                                <div className="address-header-cart">
                                    <div className="address-title-section">
                                        <h6 className="address-company">{address.companyName || 'Address'}</h6>
                                        <span className="address-number">{idx + 1}</span>
                                    </div>
                                    <div className="address-types-cart">
                                        {Array.isArray(address.type) ? (
                                            address.type.map((t) => (
                                                <span key={t} className={`badge-cart badge-${t}`}>
                                                    <i className={`fa fa-${t === 'delivery' ? 'truck' : 'receipt'}`}></i>
                                                    {t === 'delivery' ? 'Delivery' : 'Invoice'}
                                                </span>
                                            ))
                                        ) : address.type ? (
                                            <span className={`badge-cart badge-${address.type}`}>
                                                <i className={`fa fa-${address.type === 'delivery' ? 'truck' : 'receipt'}`}></i>
                                                {address.type === 'delivery' ? 'Delivery' : 'Invoice'}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="address-details-cart">
                                    <p><i className="fa fa-map-marker-alt"></i> <span className="detail-text">{address.street}</span></p>
                                    <p><i className="fa fa-building"></i> <span className="detail-text">{address.city}, {address.district}</span></p>
                                    <p><i className="fa fa-map"></i> <span className="detail-text">{address.state} - {address.pincode}</span></p>
                                    {address.location && (
                                        <p><i className="fa fa-info-circle"></i> <span className="detail-text">{address.location}</span></p>
                                    )}
                                    {address.phone && (
                                        <p><i className="fa fa-phone"></i> <span className="detail-text">{address.phone}</span></p>
                                    )}
                                    {address.gstNo && (
                                        <p><i className="fa fa-file-text"></i> <span className="detail-text gst-no">GST: {address.gstNo}</span></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-addresses-cart">
                        <i className="fa fa-map-marker-alt"></i>
                        <p>No addresses added yet</p>
                    </div>
                )}
            </div>


        </div>
    );
};

export default CartShipmentAddress;
