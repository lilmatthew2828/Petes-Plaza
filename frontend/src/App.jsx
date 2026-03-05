import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/navBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Marketplace HomePage after login/register */}
          <Route path="/homepage" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

          {/* Welcome screen with button to homepage */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          {/* Admin dashboard route */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Redirect unknown routes to Welcome */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import HomePage from './pages/HomePage'
// import './App.css'
// import AdminRoutes from './routes/AdminRoutes'

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/admin/*" element={<AdminRoutes />} />
//       </Routes>
//     </BrowserRouter>
//   )
// }
export default App;



