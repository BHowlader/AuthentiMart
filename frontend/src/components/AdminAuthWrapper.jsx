import { Outlet } from 'react-router-dom'
import { AdminAuthProvider } from '../context/AdminAuthContext'

const AdminAuthWrapper = () => {
    return (
        <AdminAuthProvider>
            <Outlet />
        </AdminAuthProvider>
    )
}

export default AdminAuthWrapper
