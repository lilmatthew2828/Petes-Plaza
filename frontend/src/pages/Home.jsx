// Displays logged-in user info and a button to go to marketplace listings.

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

export default function Home() {
  // Current authenticated user from context
  const { user } = useAuth();

  // React Router navigation (preferred over window.location.href)
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome to Petes Plaza!</h1>

        {user ? (
          <div>
            {}
            <p>
              Hello, <strong>{user.username}</strong>!
            </p>

            {/* Account details */}
            <div className="user-info">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Student ID:</strong> {user.student_id}
              </p>
              <p>
                <strong>Registered:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Route to listing grid page */}
            <button
              className="pill"
              style={{ marginTop: "2rem" }}
              onClick={() => navigate("/homepage")}
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <p>Please log in to get started.</p>
        )}
      </div>
    </div>
  );
}