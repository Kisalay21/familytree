import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = "" }) => {
    return (
        <motion.div
            className={`flex items-center gap-3 group cursor-pointer ${className}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            {/* 3 Linked Rings Icon */}
            <div className="relative w-10 h-6 flex items-center justify-center">
                <svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M12 12C12 16.4183 8.41828 20 4 20C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4C8.41828 4 12 7.58172 12 12Z" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
                    <path d="M28 12C28 16.4183 24.4183 20 20 20C15.5817 20 12 16.4183 12 12C12 7.58172 15.5817 4 20 4C24.4183 4 28 7.58172 28 12Z" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <path d="M36 4C37.1 4 38 4.9 38 6V18C38 19.1 37.1 20 36 20C31.5817 20 28 16.4183 28 12C28 7.58172 31.5817 4 36 4Z" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

            <div className="flex flex-col -gap-1">
                <span className="text-lg font-bold tracking-tight text-white leading-none">
                    Family<span className="font-light text-gray-300">United</span>
                </span>
                <span className="text-[0.5rem] font-bold tracking-[0.2em] text-cyan-400 uppercase">
                    Unbreakable
                </span>
            </div>
        </motion.div>
    );
};

export default Logo;
