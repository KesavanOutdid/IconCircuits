import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useProfile } from '../hooks/useProfile';
import { useAddresses } from '../hooks/useAddresses';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Profile.css';
import AddressManagement from '../components/AddressManagement';

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile, isLoading: profileLoading, fetchProfile, updateProfile } = useProfile();
    const { addresses, setAddressesList } = useAddresses();
    const [isEditing, setIsEditing] = useState(false);
    const [initialFormData, setInitialFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        location: '',
        country: 'India',
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        location: '',
        country: 'India',
    });
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [activeSection, setActiveSection] = useState('profile');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [user, fetchProfile, navigate]);

    useEffect(() => {
        if (profile) {
            const address = profile.address || {};
            const newData = {
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                password: '',
                confirmPassword: '',
                street: address.street || '',
                city: address.city || '',
                district: address.district || '',
                state: address.state || '',
                pincode: address.pincode || '',
                location: address.location || '',
                country: address.country || 'India',
            };
            setInitialFormData(newData);
            setFormData(newData);
            setIsFormDirty(false);
            setPasswordError('');
            if (profile.addresses) {
                setAddressesList(profile.addresses);
            }
        }
    }, [profile, setAddressesList]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        const updatedFormData = { ...formData, [id]: value };
        setFormData(updatedFormData);
        
        const hasChanges = JSON.stringify(updatedFormData) !== JSON.stringify(initialFormData);
        setIsFormDirty(hasChanges);
    };

    const handleSaveProfile = async () => {
        setPasswordError('');
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (formData.pincode && formData.pincode.length !== 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Pincode',
                text: 'Pincode must be 6 digits',
            });
            return;
        }

        try {
            const dataToSend = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: {
                    street: formData.street,
                    city: formData.city,
                    district: formData.district,
                    state: formData.state,
                    pincode: formData.pincode,
                    location: formData.location,
                    country: formData.country,
                },
            };
            if (formData.password) {
                dataToSend.password = formData.password;
            }
            await updateProfile(dataToSend);
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile has been updated successfully',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            setIsFormDirty(false);
            setIsEditing(false);
            await fetchProfile();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: err.message || 'Failed to update profile',
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    const handleCancel = () => {
        setFormData(initialFormData);
        setIsFormDirty(false);
        setIsEditing(false);
    };

    if (profileLoading || !profile) {
        return (
            <>
                <Navbar />
                <div className="profile-container">
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container-fluid pt-5 bg-primary hero-header" style={{ height: '20vh' }}>
                <div className="container pt-5">
                    <div className="row g-5 pt-3">
                        <div className="col-lg-12 text-center">
                            <h1 className="display-4 text-white mb-4 animated slideInRight">My Profile</h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <li className="breadcrumb-item"><a href="/" className="text-white">Home</a></li>
                                    <li className="breadcrumb-item text-white active">Profile</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <div className="profile-container">
                <div className="profile-wrapper">
                    <div className="profile-sidebar">
                        <div className="profile-user-card">
                            <div className="profile-avatar">
                                <i className="fa fa-user-circle"></i>
                            </div>
                            <h3>{profile.name}</h3>
                            <p className="profile-role">Customer</p>
                        </div>

                        <nav className="profile-nav">
                            <button 
                                className={`profile-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveSection('profile')}
                            >
                                <i className="fa fa-user"></i> Profile
                            </button>
                            <button 
                                className={`profile-nav-item ${activeSection === 'addresses' ? 'active' : ''}`}
                                onClick={() => setActiveSection('addresses')}
                            >
                                <i className="fa fa-map-marker-alt"></i> Address Management
                            </button>

                            {/* <button 
                                className={`profile-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveSection('orders')}
                            >
                                <i className="fa fa-shopping-bag"></i> Orders
                            </button> */}

                            <button
                                className="profile-nav-item"
                                onClick={() => navigate('/orders')}
                            >
                                <i className="fa fa-shopping-bag"></i> Orders
                            </button>
                        </nav>
                    </div>

                    <div className="profile-content">
                        {activeSection === 'profile' && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h2>Profile</h2>
                                {!isEditing && (
                                    <button class="btn-add-address" onClick={() => setIsEditing(true)}><i class="fa fa-edit"></i> Edit Profile</button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="profile-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Full Name <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                id="name"
                                                className="form-control"
                                                placeholder="Enter your full name"
                                                value={formData.name}
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
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    const event = { ...e, target: { ...e.target, id: 'phone', value } };
                                                    handleChange(event);
                                                }}
                                                maxLength="10"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="email">Email Address <span className="required">*</span></label>
                                            <input
                                                type="email"
                                                id="email"
                                                className="form-control"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                readOnly
                                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="password">New Password <span className="optional">(Optional)</span></label>
                                            <input
                                                type="password"
                                                id="password"
                                                className="form-control"
                                                placeholder="Leave blank to keep current password"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {formData.password && (
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    className="form-control"
                                                    placeholder="Confirm your new password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    style={passwordError ? { borderColor: '#d9534f' } : {}}
                                                />
                                                {passwordError && (
                                                    <small style={{ color: '#d9534f', marginTop: '5px', display: 'block' }}>
                                                        {passwordError}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e9ecef' }}>
                                        <h3 style={{ color: '#10304e', marginBottom: '8px', marginTop: '0', fontSize: '13px', fontWeight: '600' }}>Address Information</h3>
                                        
                                        <div className="form-group">
                                            <label htmlFor="street">Street Address</label>
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
                                                <label htmlFor="city">City</label>
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
                                                <label htmlFor="district">District</label>
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
                                                <label htmlFor="state">State</label>
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
                                                <label htmlFor="pincode">Pincode</label>
                                                <input
                                                    type="tel"
                                                    id="pincode"
                                                    className="form-control"
                                                    placeholder="Enter 6-digit pincode"
                                                    value={formData.pincode}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                        const event = { ...e, target: { ...e.target, id: 'pincode', value } };
                                                        handleChange(event);
                                                    }}
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
                                                    placeholder="Enter location or landmark"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            className="btn-cancel"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn-save"
                                            onClick={handleSaveProfile}
                                            disabled={!isFormDirty}
                                        >
                                            <i className="fa fa-check"></i> Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="profile-info">
                                    <div className="info-section">
                                        <h3>Personal Information</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="info-label">Name:</span>
                                                <span className="info-value">{profile.name}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">Email:</span>
                                                <span className="info-value">{profile.email}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">Phone:</span>
                                                <span className="info-value">{profile.phone || 'Not provided'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {profile.address && (
                                        <div className="info-section">
                                            <h3>Address Information</h3>
                                            <div className="info-grid">
                                                <div className="info-item">
                                                    <span className="info-label">Street:</span>
                                                    <span className="info-value">{profile.address.street || 'Not provided'}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">City:</span>
                                                    <span className="info-value">{profile.address.city || 'Not provided'}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">District:</span>
                                                    <span className="info-value">{profile.address.district || 'Not provided'}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">State:</span>
                                                    <span className="info-value">{profile.address.state || 'Not provided'}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Pincode:</span>
                                                    <span className="info-value">{profile.address.pincode || 'Not provided'}</span>
                                                </div>
                                                {profile.address.location && (
                                                    <div className="info-item">
                                                        <span className="info-label">Location:</span>
                                                        <span className="info-value">{profile.address.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        )}

                        {activeSection === 'addresses' && (
                        <div className="profile-section address-management-scrollable">
                            <AddressManagement addresses={addresses} onAddressChange={fetchProfile} />
                        </div>
                        )}

                        {activeSection === 'orders' && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h2>My Orders</h2>
                            </div>
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                <i className="fa fa-shopping-bag" style={{ fontSize: '48px', display: 'block', marginBottom: '20px' }}></i>
                                <p>No orders yet</p>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full Screen Search Start */}
            <div className="modal fade" id="searchModal" tabIndex="-1">
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content" style={{ background: " rgba(20, 24, 62, 0.7)" }}>
                        <div className="modal-header border-0">
                            <button type="button" className="btn btn-square bg-white btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex align-items-center justify-content-center">
                            <div className="input-group" style={{ maxWidth: "600px" }}>
                                <input type="text" className="form-control bg-transparent border-light p-3"
                                    placeholder="Type search keyword" style={{ color: 'white' }} />
                                <button className="btn btn-light px-4"><i className="bi bi-search"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Full Screen Search end */}

            <Footer />
        </>
    );
};

export default Profile;
