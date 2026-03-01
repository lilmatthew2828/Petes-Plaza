import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/navBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import "./App.css";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar /> {/* Removed onOpenAuth handler to use standard links */}
        <Routes>
          {/* Public Routes without logging in */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />



          {/* Protected Home Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Listings Route (protected again) */}
        <Route
          path="/listings"
          element={
            <ProtectedRoute>
              <Listings />
            </ProtectedRoute>
          }
        />

          {/* Redirect any unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;