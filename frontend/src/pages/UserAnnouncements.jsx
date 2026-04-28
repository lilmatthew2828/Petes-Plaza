import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "../styles/admin.css";


const API_URL = import.meta.env.VITE_API_URL;
// Normalize API_URL to avoid double /api/api
function apiUrl(path) {
  let url = API_URL;
  if (url.endsWith("/")) url = url.slice(0, -1);
  if (path.startsWith("/")) return url + path;
  return url + "/" + path;
}

export default function UserAnnouncements({ userId }) {
  const [deliveries, setDeliveries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);


  useEffect(() => {
    if (!userId) return;
    fetchAnnouncements();
    fetchUnread();
    // eslint-disable-next-line
  }, [userId]);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/announcements/for_user/${userId}`));
      if (!res.ok) throw new Error("Failed to fetch announcements");
      setDeliveries(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnread() {
    try {
      const res = await fetch(apiUrl(`/announcements/unread_count/${userId}`));
      if (!res.ok) throw new Error();
      setUnreadCount((await res.json()).count);
    } catch {
      setUnreadCount(0);
    }
  }

  async function markRead(deliveryId) {
    try {
      await fetch(apiUrl(`/announcements/mark_read/${deliveryId}?user_id=${userId}`), { method: "POST" });
    } catch (err) {
      console.error("Error marking announcement as read:", err);
    }
  }

  async function handleOpen() {
    setOpen(true);
    // Mark all unread announcements as read
    const unreadDeliveries = deliveries.filter(d => !d.is_read);
    if (unreadDeliveries.length > 0) {
      await Promise.all(unreadDeliveries.map(d => markRead(d.id)));
      // Refresh data after all markRead calls complete
      await Promise.all([fetchAnnouncements(), fetchUnread()]);
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className="top-tab pill"
        style={{
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          border: 'none',
          borderRadius: 999,
          background: '#2563eb',
          color: '#fff',
          padding: '8px 22px',
          fontSize: 16,
          marginLeft: 8,
          position: 'relative',
          boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onClick={handleOpen}
      >
        Announcements
        {unreadCount > 0 && (
          <span style={{
            color: '#fff',
            background: '#e53935',
            borderRadius: '50%',
            padding: '2px 8px',
            marginLeft: 8,
            fontSize: 14,
            fontWeight: 700,
            position: 'absolute',
            top: -8,
            right: -8,
            boxShadow: '0 2px 8px rgba(229,57,53,0.18)'
          }}>{unreadCount}</span>
        )}
      </button>
      {open && (
        <div style={{ position: "fixed", top: 80, right: 20, background: "#fff", border: "1px solid #ccc", borderRadius: 8, boxShadow: "0 2px 18px rgba(0,0,0,0.18)", width: 400, maxWidth: "calc(100vw - 40px)", zIndex: 9999 }}>
          <div style={{ padding: 16, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Announcements</strong>
            <button className="btn" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {loading ? <p>Loading...</p> : error ? <p className="error">{error}</p> : deliveries.length === 0 ? <p style={{ padding: 16 }}>No announcements.</p> : deliveries.map(d => (
              <div key={d.id} style={{ padding: 16, borderBottom: "1px solid #eee", background: d.is_read ? "#f9f9f9" : "#fffbe6" }}>
                <div style={{ fontWeight: 600 }}>{d.announcement.title}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{d.announcement.announcement_type} | {dayjs(d.announcement.send_at).format("YYYY-MM-DD HH:mm")}</div>
                <div style={{ marginTop: 8 }}>{d.announcement.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
