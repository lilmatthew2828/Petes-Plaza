import {Routes, Route} from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'
import AdminAnnouncements from '../pages/AdminAnnouncements'
import Transactions from '../pages/Transactions'
import Users from '../pages/Users'

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
        </Routes> 
    )
}