/*
Anthony Powell
Dedicated Admin Login Page (Iteration 4)
*/
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

import peteLogo from "/assets/images/logo.png";
import hamptonCampus from "/assets/images/HamptonWater.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
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

    const normalizedEmail = formData.identifier.trim().toLowerCase();

    if (!normalizedEmail || !formData.password) {
      setValidationError("Admin email and password are required");
      return;
    }

    if (!normalizedEmail.endsWith("@petesplaza.com")) {
      setValidationError("Admin login requires an @petesplaza.com email");
      return;
    }

    try {
      setLoading(true);
      await adminLogin({
        identifier: normalizedEmail,
        password: formData.password,
      });
      navigate("/admin");
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-container">
      <div className="branding-side">
        <div
          className="branding-overlay"
          style={{ backgroundImage: `url(${hamptonCampus})` }}
        ></div>
        <div className="branding-content">
          <h1>Pete's Plaza Admin</h1>
          <p className="branding-slogan">Marketplace Administration Portal</p>
        </div>
      </div>

      <div className="form-side">
        <div className="auth-card">
          <div className="card-logo-wrapper">
            <img src={peteLogo} alt="Pete's Plaza Logo" className="card-logo" />
          </div>

          <div className="auth-header">
            <h2>Admin Login</h2>
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
              <label>Admin Email</label>
              <input
                type="email"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="xyz@petesplaza.com"
              />
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
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>

          <p className="auth-link">
            User login: <Link to="/login">Go to default login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
