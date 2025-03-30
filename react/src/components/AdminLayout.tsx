import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function AdminLayout() {
    const { user } = useStateContext();

    // If user is not admin, redirect to dashboard
    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    // If user is admin, render the child routes
    return <Outlet />;
} 