
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import dayjs from "dayjs";
import "../styles/admin.css";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const RECIPIENT_OPTIONS = [
  { value: "all", label: "All Users & Admins" },
  { value: "users", label: "All Users" },
  { value: "admins", label: "All Admins" },
];
const TYPE_OPTIONS = [
  { value: "event", label: "Event" },
  { value: "update", label: "Update" },
  { value: "notice", label: "Notice" },
];

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const adminId = user?.id;
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("mine");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    recipient_type: "all",
    announcement_type: "event",
    send_at: dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("[AdminAnnouncements] useEffect triggered with adminId:", adminId);
    if (!adminId) {
      console.log("[AdminAnnouncements] adminId not available, skipping fetch");
      setLoading(false);
      return;
    }
    console.log("[AdminAnnouncements] adminId available, calling fetchAnnouncements");
    fetchAnnouncements();
    // eslint-disable-next-line
  }, [adminId]);

  // Normalize API_URL to avoid double /api/api
  function apiUrl(path) {
    let url = API_URL;
    if (url.endsWith("/")) url = url.slice(0, -1);
    if (path.startsWith("/")) return url + path;
    return url + "/" + path;
  }

  async function fetchAnnouncements() {
    setLoading(true);
    const mineUrl = apiUrl(`/announcements/by_admin/${adminId}`);
    const allUrl = apiUrl(`/announcements/all`);
    console.log("[AdminAnnouncements] Starting fetch:", { mineUrl, allUrl, adminId });
    try {
      // Fetch my announcements
      console.log("[AdminAnnouncements] Calling Promise.all for both endpoints...");
      const [mineRes, allRes] = await Promise.all([
        fetch(mineUrl),
        fetch(allUrl),
      ]);
      console.log("[AdminAnnouncements] Response statuses:", { mineOk: mineRes.ok, allOk: allRes.ok, mineStatus: mineRes.status, allStatus: allRes.status });
      
      if (!mineRes.ok) {
        const errorData = await mineRes.text();
        console.error("[AdminAnnouncements] mineRes error:", errorData);
        throw new Error(`Failed to fetch your announcements: ${mineRes.status} ${errorData}`);
      }
      if (!allRes.ok) {
        const errorData = await allRes.text();
        console.error("[AdminAnnouncements] allRes error:", errorData);
        throw new Error(`Failed to fetch all announcements: ${allRes.status} ${errorData}`);
      }
      
      const mineData = await mineRes.json();
      const allData = await allRes.json();
      console.log("[AdminAnnouncements] Parsed JSON:", { mineCount: mineData.length, allCount: allData.length, mineData, allData });
      
      setMyAnnouncements(mineData);
      setAllAnnouncements(allData);
      console.log("[AdminAnnouncements] State updated successfully");
    } catch (err) {
      console.error("[AdminAnnouncements] Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("[AdminAnnouncements] Loading finished");
    }
  }

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(ann) {
    setEditing(ann.id);
    setForm({
      title: ann.title,
      body: ann.body,
      recipient_type: ann.recipient_type,
      announcement_type: ann.announcement_type,
      send_at: dayjs(ann.send_at).format("YYYY-MM-DDTHH:mm"),
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Guard: Ensure adminId is loaded before submitting
    if (!adminId || typeof adminId !== 'number') {
      alert('Admin ID not loaded. Please refresh and try again.');
      return;
    }
    
    const payload = {
      title: form.title,
      body: form.body,
      recipient_type: form.recipient_type,
      announcement_type: form.announcement_type,
      send_at: dayjs(form.send_at).toISOString(),
      announcer_id: adminId,
    };
    try {
      let res;
      if (editing) {
        const updatePayload = {
          title: form.title,
          body: form.body,
          recipient_type: form.recipient_type,
          announcement_type: form.announcement_type,
          send_at: dayjs(form.send_at).toISOString(),
        };
        res = await fetch(apiUrl(`/announcements/${editing}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
      } else {
        res = await fetch(apiUrl(`/announcements/`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.detail || JSON.stringify(errorData) || `HTTP ${res.status}: Failed to save announcement`;
        console.error("Announcement error:", errorData);
        throw new Error(errorMessage);
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        title: "",
        body: "",
        recipient_type: "all",
        announcement_type: "event",
        send_at: dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
      });
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(apiUrl(`/announcements/${id}`), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  }
console.log("AUTH DEBUG:", { user, adminId });
  return (
    <div className="admin-dashboard-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#e7ecf4', position: 'relative' }}>
      {/* Sidebar toggle icon */}
      <div
        style={{ position: 'absolute', top: 24, left: 24, zIndex: 110 }}
        onClick={() => setSidebarOpen(open => !open)}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="sidebar-toggle" style={{ cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <span style={{ fontSize: 28, fontWeight: 700 }}>☰</span>
        </div>
      </div>
      <div
        style={{ position: 'absolute', left: 0, top: 0, height: '100%', zIndex: 100 }}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <AdminSidebar active="announcements" open={sidebarOpen} />
      </div>

      <div className="admin-main" style={{ flex: 1, padding: '32px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#1e293b', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px', marginLeft: 60 }}>Admin Announcements</h2>
          <div style={{ borderRadius: '50%', background: '#f3f4f6', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24, color: '#888' }}>🔔</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: 32 }}>
          <button className="btn btn-primary" style={{ marginBottom: 24, fontSize: 18, padding: '12px 28px', borderRadius: 8, fontWeight: 700 }} onClick={() => { setShowForm(true); setEditing(null); setForm({ title: "", body: "", recipient_type: "all", announcement_type: "event", send_at: dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm") }); }}>+ New Announcement</button>
          {/* Tabs for My Announcements / All Announcements */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <button className={activeTab === "mine" ? "btn btn-primary" : "btn btn-neutral"} style={{ fontWeight: 700 }} onClick={() => setActiveTab("mine")}>My Announcements</button>
            <button className={activeTab === "all" ? "btn btn-primary" : "btn btn-neutral"} style={{ fontWeight: 700 }} onClick={() => setActiveTab("all")}>All Announcements</button>
          </div>
          {showForm && (
            <form className="admin-form" onSubmit={handleSubmit} style={{ marginBottom: 32, background: '#f9fafb', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 700, color: '#2563eb' }}>Title</label>
                <input name="title" value={form.title} onChange={handleInput} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 6 }} />
              </div>
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 700, color: '#2563eb' }}>Body</label>
                <textarea name="body" value={form.body} onChange={handleInput} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 6, minHeight: 80 }} />
              </div>
              <div className="form-group" style={{ marginBottom: 18, display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 700, color: '#2563eb' }}>Recipient</label>
                  <select name="recipient_type" value={form.recipient_type} onChange={handleInput} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 6 }}>
                    {RECIPIENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 700, color: '#2563eb' }}>Type</label>
                  <select name="announcement_type" value={form.announcement_type} onChange={handleInput} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 6 }}>
                    {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 700, color: '#2563eb' }}>Send At</label>
                  <input type="datetime-local" name="send_at" value={form.send_at} onChange={handleInput} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 6 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={!adminId || typeof adminId !== 'number'}
                  style={{ 
                    flex: 1, 
                    fontWeight: 700,
                    opacity: (!adminId || typeof adminId !== 'number') ? 0.6 : 1,
                    cursor: (!adminId || typeof adminId !== 'number') ? 'not-allowed' : 'pointer'
                  }}
                >
                  {editing ? "Update" : "Create"} Announcement
                </button>
                <button className="btn btn-neutral" type="button" style={{ flex: 1, marginLeft: 12, fontWeight: 700 }} onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              </div>
            </form>
          )}

          {loading ? <p style={{ color: '#2563eb', fontWeight: 600 }}>Loading...</p> : error ? <p className="error">{error}</p> : (
            (activeTab === "mine" ? myAnnouncements : allAnnouncements).length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 24 }}>
                <span style={{ fontSize: 48, color: '#2563eb', display: 'block', marginBottom: 16 }}>📢</span>
                <h3 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.4rem', marginBottom: 8 }}>No announcements yet</h3>
                <p style={{ color: '#64748b', fontSize: 18, marginBottom: 16 }}>Create one now to keep your users informed and engaged!</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Recipient</th>
                    <th>Send At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === "mine" ? myAnnouncements : allAnnouncements).map(ann => (
                    <tr key={ann.id}>
                      <td>{ann.title}</td>
                      <td>{ann.announcement_type}</td>
                      <td>{ann.recipient_type}</td>
                      <td>{dayjs(ann.send_at).format("YYYY-MM-DD HH:mm")}</td>
                      <td>{ann.is_sent ? "Sent" : "Scheduled"}</td>
                      <td>
                        {(!activeTab || activeTab === "mine") && ann.announcer_id === adminId && (
                          <>
                            <button className="btn btn-view" onClick={() => startEdit(ann)}>Edit</button>
                            <button className="btn btn-danger" style={{ marginLeft: 8 }} onClick={() => handleDelete(ann.id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}