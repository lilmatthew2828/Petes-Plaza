import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/navBar";
import PurchaseHistory from './pages/PurchaseHistory';
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import EditListing from "./pages/EditListing";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import MySoldListings from "./pages/sold_items"; // EMMANUELLA OBIDIKE
import SellerPage from "./pages/SellerPage"; // new - mkp


function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
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
          /> {/* EMMANUELLA OBIDIKE */}
          <Route
          path="/my-sold"
          element={
            <ProtectedRoute>
              <MySoldListings />
            </ProtectedRoute>
          }
        />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
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
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/:sellerId"
            element={
              <ProtectedRoute>
                <SellerPage />
              </ProtectedRoute>
            }
          />

          {/* Listings routes */}
          <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />

          <Route path="/listings/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />

          {/* Redirect create-listing to Listings page */}
          <Route path="/create-listing" element={<Navigate to="/listings" replace />} />

          {/* Purchase history route */}
          <Route path="/purchase-history" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
          
          {/* Redirect unknown routes to Welcome */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
