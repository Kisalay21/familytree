import React from 'react';
import { motion } from 'framer-motion';
import './Logo.css';

const Logo = ({ className = "" }) => {
    return (
        <motion.div
            className={`flex items-center gap-3 group cursor-pointer ${className}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            {/* 3 Linked Rings Icon - CSS Implementation */}
            <div className="chain-logo-container">
                <div className="chain-logo-scaled">
                    <div className="chain-link link-1"></div>
                    <div className="chain-link link-2"></div>
                    <div className="chain-link link-3"></div>
                </div>
            </div>


        </motion.div>
    );
};

export default Logo;
