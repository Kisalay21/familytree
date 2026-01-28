import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose, initialMode = 'signup' }) => {
    const [mode, setMode] = React.useState(initialMode);

    React.useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
        }
    }, [initialMode, isOpen]);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dob: '',
        work: '',
        location: '',
        father: '',
        mother: '',
        patGF: '',
        patGM: '',
        matGF: '',
        matGM: '',
        patGGF: '',
        patGGM: '',
        matGGF: '',
        matGGM: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMockLogin = (e) => {
        e.preventDefault();
        // Simulate login/signup and save profile
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userProfile', JSON.stringify({
            displayName: formData.name || 'Demo User',
            email: formData.email || 'demo@example.com',
            dob: formData.dob,
            work: formData.work,
            location: formData.location,
            heritage: {
                father: formData.father,
                mother: formData.mother,
                paternal: {
                    grandfather: formData.patGF,
                    grandmother: formData.patGM,
                    greatGrandfather: formData.patGGF,
                    greatGrandmother: formData.patGGM
                },
                maternal: {
                    grandfather: formData.matGF,
                    grandmother: formData.matGM,
                    greatGrandfather: formData.matGGF,
                    greatGrandmother: formData.matGGM
                }
            },
            immediateFamily: [
                { name: formData.father, relation: "Pita Ji (Father)", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" },
                { name: formData.mother, relation: "Mata Ji (Mother)", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" }
            ]
        }));
        navigate('/app');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-start p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className={`relative w-full ${mode === 'login' ? 'max-w-md' : 'max-w-2xl'} bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] my-12 transition-all duration-500`}
                    >
                        {/* Glossy top edge */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                {mode === 'login' ? 'Dimension Access' : 'Forge Your Lineage'}
                            </h2>
                            <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-medium opacity-60">
                                {mode === 'login'
                                    ? 'Authentication Required'
                                    : 'Establish your genetic anchor'}
                            </p>
                        </div>

                        <form onSubmit={handleMockLogin} className="space-y-8">
                            {mode === 'signup' ? (
                                <>
                                    {/* Personal Info */}
                                    <div className="bg-white/[0.02] rounded-2xl border border-white/10 p-6 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Personal Coordinates</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="John Doe"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="john@example.com"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    name="dob"
                                                    value={formData.dob}
                                                    onChange={handleChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Current Occupation</label>
                                                <input
                                                    type="text"
                                                    name="work"
                                                    value={formData.work}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Software Architect"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Place of Residence</label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="City, Country"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Paternal Lineage */}
                                    <div className="bg-purple-500/5 rounded-xl border border-purple-500/10 p-5 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                            <h3 className="text-sm font-bold text-purple-200 uppercase tracking-widest">Paternal Lineage</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Father's Full Name</label>
                                                <input name="father" value={formData.father} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-purple-500" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Paternal Grandfather</label>
                                                <input name="patGF" value={formData.patGF} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2 text-sm text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Paternal Grandmother</label>
                                                <input name="patGM" value={formData.patGM} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2 text-sm text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase text-gray-500 font-medium mb-1 italic">Great-Grandfather</label>
                                                <input name="patGGF" value={formData.patGGF} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2 text-xs text-white opacity-70" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase text-gray-500 font-medium mb-1 italic">Great-Grandmother</label>
                                                <input name="patGGM" value={formData.patGGM} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2 text-xs text-white opacity-70" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Maternal Lineage */}
                                    <div className="bg-indigo-500/5 rounded-xl border border-indigo-500/10 p-5 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                            <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-widest">Maternal Lineage</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Mother's Full Name</label>
                                                <input name="mother" value={formData.mother} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Maternal Grandfather</label>
                                                <input name="matGF" value={formData.matGF} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2 text-sm text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Maternal Grandmother</label>
                                                <input name="matGM" value={formData.matGM} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2 text-sm text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase text-gray-500 font-medium mb-1 italic">Great-Grandfather</label>
                                                <input name="matGGF" value={formData.matGGF} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2 text-xs text-white opacity-70" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase text-gray-500 font-medium mb-1 italic">Great-Grandmother</label>
                                                <input name="matGGM" value={formData.matGGM} onChange={handleChange} className="w-full bg-[#14141d] border border-white/10 rounded-lg px-4 py-2 text-xs text-white opacity-70" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1.5 tracking-wider">Secure Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500 outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Security Key (Password)</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500 outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 text-sm tracking-widest uppercase"
                            >
                                {mode === 'login' ? 'Enter Dimension' : 'Forge Lineage'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <button
                                onClick={() => handleMockLogin({ preventDefault: () => { } })}
                                className="text-[10px] uppercase tracking-tighter text-purple-400 hover:text-purple-300 font-bold flex items-center justify-center gap-1 mx-auto mb-4 opacity-60"
                            >
                                Rapid Analysis Mode (Instant Access) <ArrowRight size={10} />
                            </button>

                            <p className="text-gray-500 text-xs">
                                {mode === 'login' ? "New to the Lineage? " : "Already established? "}
                                <button
                                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                    className="text-white font-bold hover:underline ml-1 uppercase"
                                >
                                    {mode === 'login' ? 'Sign Up' : 'Login'}
                                </button>
                            </p>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
