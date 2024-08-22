/*import React, { useContext } from "react";
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext';
import Profile from "./Profile";


const SideNav = () => {
    const { logout } = useContext(AuthContext);


    return (

        <div className="side-nav d-flex flex-column p-3" >

            < Profile />
            <ul className="nav flex-column">
                <li className="nav-item mb-3">
                    <Link to="/user-management" className="nav-link">Manage Users</Link>
                </li>
                <li className="nav-item mb-3">
                    <Link to="/chat" className="nav-link">Chat</Link>
                </li>
            </ul>
            <button className="btn btn-danger mt-auto" onClick={logout}>Logout</button>
        </div>

    );

};

export default SideNav; */
import React, { useState, useContext } from "react";
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Profile from "./Profile";

const SideNav = () => {
    const { logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <button className="hamburger-btn" onClick={toggleMenu}>
                ☰
            </button>

            <div className={`side-nav ${isOpen ? 'open' : ''}`}>
                <Profile />
                <ul className="nav flex-column">
                    <li className="nav-item mb-3">
                        <Link to="/user-management" className="nav-link" onClick={toggleMenu}>Manage Users</Link>
                    </li>
                    <li className="nav-item mb-3">
                        <Link to="/chat" className="nav-link" onClick={toggleMenu}>Chat</Link>
                    </li>
                </ul>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>

            {isOpen && <div className="overlay active" onClick={toggleMenu}></div>}
        </>
    );
};

export default SideNav;




