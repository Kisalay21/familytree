import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import FamilyTree from './pages/FamilyTree';
import Chat from './pages/Chat';
import Layout from './components/Layout';
import ParticleBackground from './components/ParticleBackground';

import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AnimatedRoutes = () => {
    const location = useLocation();

    const isAuthenticated = () => {
        return localStorage.getItem('isAuthenticated') === 'true';
    };

    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated()) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/zen" element={<ParticleBackground />} />
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Profile />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Profile />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tree"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <FamilyTree />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Chat />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/vault"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Profile defaultTab="vault" />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    return (
        <Router>
            <AnimatedRoutes />
        </Router>
    );
}

export default App;
