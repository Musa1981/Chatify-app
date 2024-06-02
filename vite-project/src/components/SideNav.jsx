import React from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const SideNav = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        location.href = '/login'
    };

    return (
        <div className="d-flex flex-column p-3 bg-light">
            <button className="btn btn-danger mt-auto" onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default SideNav;
