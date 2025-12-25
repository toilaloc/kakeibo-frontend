import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { routes } from './routes';
import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';

function AppRouter() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <p>Loading...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute requiresAuth={route.protected}>
                {route.protected ? (
                  <div className="main-layout">
                    <Navigation />
                    <main className="main-content">
                      {route.element}
                    </main>
                  </div>
                ) : (
                  route.element
                )}
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
    </div>
  );
}

export default AppRouter;