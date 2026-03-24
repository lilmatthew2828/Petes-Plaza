import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import EditListing from "./pages/EditListing";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";


function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homepage"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:listingId/edit"
            element={
              <ProtectedRoute>
                <EditListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Listings routes */}
          <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />

          <Route path="/listings/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />

          {/* Redirect create-listing to Listings page */}
          <Route path="/create-listing" element={<Navigate to="/listings" replace />} />

          {/* Redirect unknown routes to Welcome */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
