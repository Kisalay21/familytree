import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import AuthModal from '../components/AuthModal';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Plus, Share2 } from 'lucide-react';
import Logo from '../components/Logo';

const FeatureCard = ({ title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/[0.08] transition-all group text-center"
    >
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

const LandingPage = () => {
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('signup');
    const featuresRef = useRef(null);

    const scrollToFeatures = () => {
        featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleOpenAuth = (mode) => {
        setAuthMode(mode);
        setAuthOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen font-sans text-white"
        >
            <ParticleBackground />
            <Navbar onOpenAuth={handleOpenAuth} />

            {/* Hero Section */}
            <main className="relative z-10">
                <section className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="mb-8"
                    >
                        <div className="flex justify-center mb-8">
                            <Logo className="scale-[2.5]" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">Family United</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed font-medium"
                    >
                        Unbreakable bonds, forever connected. A private space designed strictly for family heritage, connection, and legacy.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-5"
                    >
                        <button
                            onClick={() => handleOpenAuth('signup')}
                            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-3 group"
                        >
                            Forge Your Tree
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </button>

                        <button
                            onClick={scrollToFeatures}
                            className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                            The Dimension
                        </button>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 1.5, duration: 1, repeat: Infinity }}
                        className="absolute bottom-10 flex flex-col items-center gap-2"
                    >
                        <div className="w-px h-12 bg-gradient-to-b from-purple-500 to-transparent" />
                    </motion.div>
                </section>

                {/* Features Section */}
                <section ref={featuresRef} className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        title="Lineage Verification"
                        desc="Connect logic ensures you only add verified relatives. Build a tree that is genetically accurate and secure."
                        delay={0.1}
                    />
                    <FeatureCard
                        title="3rd Cousin Precision"
                        desc="Our dimension calculates connections up to the 3rd cousin, bringing family you've never met back into the circle."
                        delay={0.2}
                    />
                    <FeatureCard
                        title="Digital Vaults"
                        desc="Seal family secrets, recipes, and memories in private vaults that only your direct bloodline can ever access."
                        delay={0.3}
                    />
                </section>
            </main>

            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
                initialMode={authMode}
            />
        </motion.div>
    );
};

export default LandingPage;
