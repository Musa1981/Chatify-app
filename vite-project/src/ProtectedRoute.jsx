import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Denna komponent används för att skydda rutter som kräver autentisering
const ProtectedRoute = () => {
    // Hämta token från AuthContext som används för att avgöra om användaren är inloggad
    const { token } = useContext(AuthContext);

    // Om token finns (användaren är inloggad), rendera det som ligger i Outlet (det skyddade innehållet)
    // Annars, om ingen token finns (användaren är inte inloggad), omdirigera till inloggningssidan
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

