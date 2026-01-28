import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = "" }) => {
    return (
        <motion.div
            className={`flex items-center gap-2 group cursor-pointer ${className}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg rotate-3 group-hover:rotate-6 transition-transform" />
                <div className="absolute inset-0 bg-[#0a0a0c] rounded-lg flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-colors">
                    <span className="font-bold text-white text-lg">D</span>
                </div>
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">
                DIMENSION
            </span>
        </motion.div>
    );
};

export default Logo;
