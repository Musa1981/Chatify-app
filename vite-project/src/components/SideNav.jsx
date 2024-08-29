import React, { useState, useContext } from "react";
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Profile from "./Profile";

const SideNav = () => {
    const { logout } = useContext(AuthContext); // Hämtar logout-funktionen från AuthContext
    const [isOpen, setIsOpen] = useState(false); // State för att kontrollera om menyn är öppen eller stängd

    // Funktion för att toggla (växla) menyns öppna/stängda tillstånd
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Funktion för att logga ut användaren
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
                        <Link to="/user-management" className="btn btn-primary w-100" onClick={toggleMenu}>Manage Users</Link>

                    </li>
                    <li className="nav-item mb-3">
                        <Link to="/chat" className="btn btn-primary w-100" onClick={toggleMenu}>Chat</Link>

                    </li>
                </ul>


                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>

            </div>

            {isOpen && <div className="overlay active" onClick={toggleMenu}></div>}

        </>
    );
};

export default SideNav;
