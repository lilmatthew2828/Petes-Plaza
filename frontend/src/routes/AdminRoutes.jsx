import {Routes, Route} from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'
import AdminAnnouncements from '../pages/AdminAnnouncements'

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
        </Routes> 
    )
}