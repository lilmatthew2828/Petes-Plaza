import React from "react";
import "../styles/admin.css";

// Sidebar component for admin dashboard with navigation links and icons for Dashboard, Users, Orders, and Announcements.
export default function AdminSidebar({ active, open }) {
  return (
    <div className="admin-sidebar" style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)' }}>
      <div className="sidebar-title" style={{ fontWeight: 800, fontSize: '1.4rem', fontFamily: 'Inter, sans-serif', color: '#2563eb', letterSpacing: '-1px', marginBottom: 24 }}>Pete's Plaza Admin</div>
      <ul className="sidebar-nav">
        <li className={active === "dashboard" ? "active" : ""}> 
          <span className="sidebar-icon">📊</span> Dashboard
        </li>
        <li className={active === "users" ? "active" : ""}>
          <span className="sidebar-icon">👤</span> Users
        </li>
        <li className={active === "orders" ? "active" : ""}>
          <span className="sidebar-icon">🛒</span> Orders
        </li>
        <li className={active === "announcements" ? "active" : ""}>
          <span className="sidebar-icon">🔔</span> Announcements
        </li>
      </ul>
    </div>
  );
}
