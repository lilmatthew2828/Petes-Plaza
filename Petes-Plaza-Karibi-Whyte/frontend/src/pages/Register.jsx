import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

// Assets imported from your src/assets folder
import peteLogo from "/assets/images/logo.png";
import hamptonCampus from "/assets/images/HamptonWater.png";

export default function Register() {
  const navigate = useNavigate();
  // Using named import for useAuth to prevent the SyntaxError seen previously
  const { register: registerUser, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    student_id: "",
    password: "",
    confirm_password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  function handleChange(e) {
    setValidationError(null);
    clearError();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null); 
    clearError();

    // Validation logic
    if (!formData.email || !formData.username || !formData.student_id || !formData.password) {
      setValidationError("All fields are required");
      return;
    }

    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setValidationError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await registerUser(formData);
      navigate("/homepage");
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-container">
      {/* Left Side: Branding Visual */}
      <div className="branding-side">
        <div 
          className="branding-overlay" 
          style={{ backgroundImage: `url(${hamptonCampus})` }}
        ></div>
        <div className="branding-content">
          <h1>Pete's Plaza</h1>
          <p className="branding-slogan">"By Pirates, For Pirates."</p>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="form-side">
        <div className="auth-card register-card">
          {/* Floating Logo positioned on the card edge */}
          <div className="card-logo-wrapper">
            <img src={peteLogo} alt="Pete's Plaza Logo" className="card-logo" />
          </div>

          <div className="auth-header">
            <h2>Join the Plaza</h2>
            <div className="divider">
               <span className="line"></span>
               <span className="icon">⚓</span>
               <span className="line"></span>
            </div>
          </div>

          {(error || validationError) && (
            <div className="error-message">{error || validationError}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Student ID</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <span className="hu-indicator">H</span>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}