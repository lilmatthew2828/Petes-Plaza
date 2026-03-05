import { useAuth } from "../context/AuthContext";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome to Petes Plaza!</h1>
        {user ? (
          <div>
            <p>Hello, <strong>{user.username}</strong>!</p>
            <div className="user-info">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Student ID:</strong> {user.student_id}</p>
              <p><strong>Registered:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <button className="pill" style={{marginTop: '2rem'}} onClick={() => window.location.href = '/homepage'}>
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