import React, { useContext } from "react";
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext';

const SideNav = () => {
    const { logout } = useContext(AuthContext);


    return (
        <div className="side-nav">
            <Link to="/user-management">Manage Users</Link>
            <br></br>
            <Link to="/chat">Chat</Link>
            <button className="btn btn-danger mt-auto" style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'green'
            }} onClick={logout}>Logout</button>
        </div>
    );
};

export default SideNav;
