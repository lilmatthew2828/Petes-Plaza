import React from "react";
import "../styles/admin.css";
import { useNavigate } from "react-router-dom";

// Daye Karibi-Whyte - whole file
// Sidebar component for admin dashboard with navigation links and icons for Dashboard, Users, Orders, and Announcements.
export default function AdminSidebar({ active, open }) {
  const navigate = useNavigate();
  return (
    <div className="admin-sidebar" style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)' }}>
      <div className="sidebar-title" style={{ fontWeight: 800, fontSize: '1.4rem', fontFamily: 'Inter, sans-serif', color: '#2563eb', letterSpacing: '-1px', marginBottom: 24 }}>Pete's Plaza Admin</div>
      <ul className="sidebar-nav">
        <li className={active === "dashboard" ? "active" : ""}
          onClick={() => navigate("/admin")}> 
          <span className="sidebar-icon">📊</span> Dashboard
        </li>
        <li className={active === "users" ? "active" : ""}
          onClick={() => navigate("/admin/users")}> 
          <span className="sidebar-icon">👤</span> Users
        </li>
        <li className={active === "listings" ? "active" : ""}
          onClick={() => navigate("/admin/listings")}> 
          <span className="sidebar-icon">📦</span> Listings
        </li>
        <li className={active === "transactions" ? "active" : ""}
          onClick={() => navigate("/admin/transactions")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon">💰</span> Transactions
        </li>
        <li className={active === "announcements" ? "active" : ""}
          onClick={() => navigate("/admin/announcements")}> 
          <span className="sidebar-icon">🔔</span> Announcements
        </li>
      </ul>
    </div>
  );
}
