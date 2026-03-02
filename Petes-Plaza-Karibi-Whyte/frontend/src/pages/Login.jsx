import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

// Assets
import peteLogo from "/assets/images/logo.png";
import hamptonCampus from "/assets/images/HamptonWater.png";

export default function Login() {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
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

    if (!formData.identifier || !formData.password) {
      setValidationError("Email/username and password are required");
      return;
    }

    try {
      setLoading(true);
      await login(formData);
      navigate("/homepage");
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-container">
      {/* Left Side: Campus Visual Only */}
      <div className="branding-side">
        <div 
          className="branding-overlay" 
          style={{ backgroundImage: `url(${hamptonCampus})` }}
        ></div>
        <div className="branding-content">
          <h1>Welcome to Hampton University's Marketplace</h1>
          <p className="branding-slogan">"By Pirates, For Pirates."</p>
        </div>
      </div>

      {/* Right Side: Form with Logo on top */}
      <div className="form-side">
        <div className="auth-card">
          {/* Logo moved here to be on top of the card */}
          <div className="card-logo-wrapper">
            <img src={peteLogo} alt="Pete's Plaza Logo" className="card-logo" />
          </div>

          <div className="auth-header">
            <h2>Log In</h2>
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
              <label>Email or Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
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

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}