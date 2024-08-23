import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Importerar huvudapplikationskomponenten
import 'bootstrap/dist/css/bootstrap.min.css'; // Importerar Bootstrap CSS för styling
import { AuthProvider } from './contexts/AuthContext'; // Importerar AuthProvider för att ge autentiseringstillgång till hela appen
import { BrowserRouter as Router } from 'react-router-dom'; // Importerar BrowserRouter för routing

// Skapar en root för React-applikationen och renderar den i DOM-elementet med id 'root'
createRoot(document.getElementById('root')).render(
  <Router>
    {/* AuthProvider gör autentiseringstillgång tillgänglig för hela applikationen */}
    <AuthProvider>
      {/* Renderar huvudkomponenten av applikationen */}
      <App />
    </AuthProvider>
  </Router>
);
