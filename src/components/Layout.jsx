import React, { useState, useEffect } from 'react';
import ParticleBackground from './ParticleBackground';
import AppNavbar from './AppNavbar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const safeParse = (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error(`Error parsing ${key} from localStorage:`, e);
                return null;
            }
        };

        const saved = safeParse('userProfile');
        if (saved) setUserProfile(saved);

        const handleStorage = () => {
            const updated = safeParse('userProfile');
            if (updated) setUserProfile(updated);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className="relative min-h-screen font-sans text-white overflow-hidden">
            <ParticleBackground />
            <AppNavbar userProfile={userProfile} />
            <motion.div
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 pt-16 min-h-screen"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default Layout;
