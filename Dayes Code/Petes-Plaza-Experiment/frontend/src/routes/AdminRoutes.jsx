import {Routes, Route} from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
        </Routes> 
    )
}