import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useRegister } from '../hooks/useRegister';
import '../assets/css/Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const {
        formData,
        showPassword,
        currentStep,
        isLoading,
        error,
        validationErrors,
        handleChange,
        handleNextStep,
        handlePrevStep,
        handleSubmit: onSubmit,
        togglePasswordVisibility,
    } = useRegister();

    const handleSubmit = async (e) => {
        const result = await onSubmit(e);
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Account Created!',
                text: 'Your account has been created successfully. Redirecting to login...',
                timer: 10000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                navigate('/login');
            });
        } else {
            const errorMessage = result.error || error || 'Please enter missing Required Fields';
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: errorMessage,
                confirmButtonText: 'OK',
                didOpen: (modal) => {
                    const textElement = modal.querySelector('.swal2-html-container');
                    if (textElement) {
                        textElement.style.wordWrap = 'break-word';
                    }
                }
            });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                {/* Left Side - Form */}
                <div className="auth-form-section">
                    <div className="auth-header">
                        <Link to="/" className="auth-back-btn">
                            <i className="fa fa-arrow-left"></i>
                        </Link>
                        <p className="auth-toggle-text">
                            Already member?{' '}
                            <Link to="/login" className="auth-link-primary">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="auth-content">
                        <h1 className="auth-title">Sign Up</h1>
                        <p className="auth-subtitle">Create your Icon Circuits account</p>

                        {/* Progress Indicator */}
                        <div className="progress-steps">
                            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                                <div className="step-number">1</div>
                                <p className="step-label">Account</p>
                            </div>
                            <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
                            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                                <div className="step-number">2</div>
                                <p className="step-label">Address</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {/* Step 1: Account Details */}
                            {currentStep === 1 && (
                                <>
                                    {/* Name Field */}
                                    <div className="form-group">
                                        <label htmlFor="name" className="form-label">
                                            <i className="fa fa-user"></i> Full Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="form-control auth-input"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                        {validationErrors.name && (
                                            <small className="text-danger">{validationErrors.name}</small>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">
                                            <i className="fa fa-envelope"></i> Email Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="form-control auth-input"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        {validationErrors.email && (
                                            <small className="text-danger">{validationErrors.email}</small>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label">
                                            <i className="fa fa-lock"></i> Password <span className="text-danger">*</span>
                                        </label>
                                        <div className="password-wrapper">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                className="form-control auth-input"
                                                placeholder="Create a strong password"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={togglePasswordVisibility}
                                            >
                                                <i className={`fa fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                                            </button>
                                        </div>
                                        {validationErrors.password && (
                                            <small className="text-danger">{validationErrors.password}</small>
                                        )}
                                        <small className="password-hint">
                                            At least 6 characters with uppercase, lowercase, and numbers
                                        </small>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            <i className="fa fa-lock"></i> Confirm Password <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            className="form-control auth-input"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        {validationErrors.confirmPassword && (
                                            <small className="text-danger">{validationErrors.confirmPassword}</small>
                                        )}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        type="button"
                                        className="btn-auth-primary"
                                        onClick={handleNextStep}
                                    >
                                        Next
                                        <i className="fa fa-arrow-right ms-2"></i>
                                    </button>
                                </>
                            )}

                            {/* Step 2: Address Details */}
                            {currentStep === 2 && (
                                <>
                                    {/* Phone Field */}
                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">
                                            <i className="fa fa-phone"></i> Phone Number <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            className="form-control auth-input"
                                            placeholder="+91 XXXXXXXXXX"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            maxLength={10}
                                            minLength={10}
                                        />
                                        {validationErrors.phone && (
                                            <small className="text-danger">{validationErrors.phone}</small>
                                        )}
                                    </div>

                                    {/* Street Field */}
                                    <div className="form-group">
                                        <label htmlFor="address.street" className="form-label">
                                            <i className="fa fa-home"></i> Street Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="address.street"
                                            className="form-control auth-input"
                                            placeholder="123 Main Street"
                                            value={formData.address.street}
                                            onChange={handleChange}
                                        />
                                        {validationErrors['address.street'] && (
                                            <small className="text-danger">{validationErrors['address.street']}</small>
                                        )}
                                    </div>

                                    {/* Two Column Fields */}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="address.city" className="form-label">
                                                    City <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address.city"
                                                    className="form-control auth-input"
                                                    placeholder="Mumbai"
                                                    value={formData.address.city}
                                                    onChange={handleChange}
                                                />
                                                {validationErrors['address.city'] && (
                                                    <small className="text-danger">{validationErrors['address.city']}</small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="address.district" className="form-label">
                                                    District <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address.district"
                                                    className="form-control auth-input"
                                                    placeholder="Mumbai City"
                                                    value={formData.address.district}
                                                    onChange={handleChange}
                                                />
                                                {validationErrors['address.district'] && (
                                                    <small className="text-danger">{validationErrors['address.district']}</small>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Two Column Fields */}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="address.state" className="form-label">
                                                    State <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address.state"
                                                    className="form-control auth-input"
                                                    placeholder="Maharashtra"
                                                    value={formData.address.state}
                                                    onChange={handleChange}
                                                />
                                                {validationErrors['address.state'] && (
                                                    <small className="text-danger">{validationErrors['address.state']}</small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="address.pincode" className="form-label">
                                                    Pincode <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address.pincode"
                                                    className="form-control auth-input"
                                                    placeholder="400001"
                                                    value={formData.address.pincode}
                                                    onChange={handleChange}
                                                />
                                                {validationErrors['address.pincode'] && (
                                                    <small className="text-danger">{validationErrors['address.pincode']}</small>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Field */}
                                    <div className="form-group">
                                        <label htmlFor="address.location" className="form-label">
                                            <i className="fa fa-map-marker-alt"></i> Landmark/Location <span className="text-muted">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="address.location"
                                            className="form-control auth-input"
                                            placeholder="Near Central Park"
                                            value={formData.address.location}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-auth-secondary"
                                            onClick={handlePrevStep}
                                        >
                                            <i className="fa fa-arrow-left me-2"></i> Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-auth-primary"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Creating Account...' : 'Create Account'}
                                            <i className="fa fa-check ms-2"></i>
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="auth-visual-section">
                    <div className="auth-visual-content">
                        <img
                            src="/img/pcb-layout.jpg"
                            alt="Register"
                            className="auth-visual-image"
                        />
                        <div className="auth-visual-overlay">
                            <h2>Join Our Community</h2>
                            <p>Create your account and get started with premium PCB services</p>
                            <div className="auth-visual-features">
                                <div className="feature-item">
                                    <i className="fa fa-bolt"></i>
                                    <span>Fast Manufacturing</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fa fa-star"></i>
                                    <span>Quality Assured</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fa fa-handshake"></i>
                                    <span>Expert Support</span>
                                </div>
                            </div>
                        </div>
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
        </div>
    );
};

export default Register;
