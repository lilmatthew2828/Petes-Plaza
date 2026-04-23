// Jania Southall - NavBar component that displays the site title, 
// user greeting, and login/logout links.
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-brand"> 
          Pete’s <span>Plaza</span>
        </h1>
        <div className="navbar-right">
          {user ? (
            <>
              <span className="navbar-user">Welcome, {user.username}</span>
              <button className="navbar-logout" onClick={handleLogout}>
                Logout
              </button> 
            </>
          ) : (
            <>
              <button className="navbar-link" onClick={() => window.location.href = '/admin-login'}>
                Admin Login
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}