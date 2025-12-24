import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLogin } from '../hooks/useLogin';
// import { useCart } from '../context/CartContext';
import '../assets/css/Auth.css';

const Login = () => {
    const navigate = useNavigate();
    // const { fetchCart } = useCart();
    const {
        formData,
        showPassword,
        isLoading,
        error,
        validationErrors,
        handleChange,
        handleSubmit: onSubmit,
        togglePasswordVisibility,
    } = useLogin();

    const handleSubmit = async (e) => {
        const result = await onSubmit(e);
        if (result.success) {
            // const token = localStorage.getItem('token');
            // if (token) {
            //     fetchCart(token);
            // }
            Swal.fire({
                icon: 'success',
                title: 'Welcome Back!',
                text: 'Login successful',
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                navigate('/');
            });
        } else {
            const errorMessage = result.error || error || 'Please check your email and password';
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
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
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link-primary">
                                Sign Up
                            </Link>
                        </p>
                    </div>

                    <div className="auth-content">
                        <h1 className="auth-title">Sign In</h1>
                        <p className="auth-subtitle">Access your Icon Circuits account</p>

                        <form onSubmit={handleSubmit} className="auth-form">
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
                                    required
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
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
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
                            </div>

                            {/* Forgot Password */}
                            <div className="auth-options">
                                <Link to="#" className="forgot-link">
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-auth-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                                <i className="fa fa-arrow-right ms-2"></i>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="auth-visual-section">
                    <div className="auth-visual-content">
                        <img
                            src="/img/pcb-design.jpg"
                            alt="Login"
                            className="auth-visual-image"
                        />
                        <div className="auth-visual-overlay">
                            <h2>Access Your Account</h2>
                            <p>Manage your PCB projects, track orders, and collaborate with our team</p>
                            <div className="auth-visual-features">
                                <div className="feature-item">
                                    <i className="fa fa-project-diagram"></i>
                                    <span>Project Management</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fa fa-shopping-bag"></i>
                                    <span>Track Orders</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fa fa-shield-alt"></i>
                                    <span>Secure & Safe</span>
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

export default Login;
