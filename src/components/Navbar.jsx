import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';
import Logo from './Logo';

const Navbar = ({ onOpenAuth }) => {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-black/20 border-b border-white/5">
            <Link to="/">
                <Logo className="scale-90" />
            </Link>

            {/* Centered Navigation */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8">
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Lineage</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Memories</a>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => onOpenAuth('login')}
                    className="text-white text-sm font-medium hover:text-white/80 transition-colors hidden sm:block"
                >
                    Login
                </button>
                <button
                    onClick={() => onOpenAuth('signup')}
                    className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                    Sign Up
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
