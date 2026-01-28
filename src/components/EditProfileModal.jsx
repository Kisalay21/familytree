import React, { useState } from 'react';
import { X, Save, User, MapPin, Briefcase, Info, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditProfileModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState(initialData);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0f0f11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141416]">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-400" />
                            Edit Profile
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <form id="edit-profile-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Display Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            {/* Work */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Occupation</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        name="work"
                                        value={formData.work}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                        placeholder="Job Title"
                                    />
                                </div>
                            </div>

                            {/* DOB */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            {/* Father Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Father's Name</label>
                                <input
                                    type="text"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                    placeholder="Pita Ji's Name"
                                />
                            </div>

                            {/* Mother Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mother's Name</label>
                                <input
                                    type="text"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                    placeholder="Mata Ji's Name"
                                />
                            </div>
                        </div>

                        {/* Lineage Section */}
                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="p-1 px-2 bg-purple-500/20 rounded text-[10px] font-black text-purple-400 tracking-widest uppercase">Paternal Lineage</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Paternal Grandfather</label>
                                    <input
                                        type="text"
                                        value={formData.heritage?.paternal?.grandfather || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            heritage: {
                                                ...prev.heritage,
                                                paternal: { ...(prev.heritage?.paternal || {}), grandfather: e.target.value }
                                            }
                                        }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:border-purple-500/30 outline-none transition-all"
                                        placeholder="Grandfather's Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Paternal Grandmother</label>
                                    <input
                                        type="text"
                                        value={formData.heritage?.paternal?.grandmother || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            heritage: {
                                                ...prev.heritage,
                                                paternal: { ...(prev.heritage?.paternal || {}), grandmother: e.target.value }
                                            }
                                        }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:border-purple-500/30 outline-none transition-all"
                                        placeholder="Grandmother's Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-gray-600 uppercase tracking-wider italic">Paternal G-Grandfather</label>
                                    <input
                                        type="text"
                                        value={formData.heritage?.paternal?.greatGrandfather || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            heritage: {
                                                ...prev.heritage,
                                                paternal: { ...(prev.heritage?.paternal || {}), greatGrandfather: e.target.value }
                                            }
                                        }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-xs text-gray-400 focus:border-purple-500/30 outline-none transition-all"
                                        placeholder="G-Grandfather"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-gray-600 uppercase tracking-wider italic">Paternal G-Grandmother</label>
                                    <input
                                        type="text"
                                        value={formData.heritage?.paternal?.greatGrandmother || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            heritage: {
                                                ...prev.heritage,
                                                paternal: { ...(prev.heritage?.paternal || {}), greatGrandmother: e.target.value }
                                            }
                                        }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-xs text-gray-400 focus:border-purple-500/30 outline-none transition-all"
                                        placeholder="G-Grandmother"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="p-1 px-2 bg-blue-500/20 rounded text-[10px] font-black text-blue-400 tracking-widest uppercase">Maternal Lineage</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Maternal Grandfather</label>
                                    <input
                                        type="text"
                                        value={formData.heritage?.maternal?.grandfather || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            heritage: {
                                                ...prev.heritage,
                                                maternal: { ...(prev.heritage?.maternal || {}), grandfather: e.target.value }
                                            }
                                        }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:border-blue-500/30 outline-none transition-all"
                                        placeholder="Grandfather's Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Maternal Grandmother</label>
                                    <input
                                        type="text"
                                        value={formData.heritage?.maternal?.grandmother || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            heritage: {
                                                ...prev.heritage,
                                                maternal: { ...(prev.heritage?.maternal || {}), grandmother: e.target.value }
                                            }
                                        }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:border-blue-500/30 outline-none transition-all"
                                        placeholder="Grandmother's Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-gray-600 uppercase tracking-wider italic">Maternal G-Grandfather</label>
                                    <input
                                        type="text"
                                        value={formData.heritage?.maternal?.greatGrandfather || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            heritage: {
                                                ...prev.heritage,
                                                maternal: { ...(prev.heritage?.maternal || {}), greatGrandfather: e.target.value }
                                            }
                                        }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-xs text-gray-400 focus:border-blue-500/30 outline-none transition-all"
                                        placeholder="G-Grandfather"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-gray-600 uppercase tracking-wider italic">Maternal G-Grandmother</label>
                                    <input
                                        type="text"
                                        value={formData.heritage?.maternal?.greatGrandmother || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            heritage: {
                                                ...prev.heritage,
                                                maternal: { ...(prev.heritage?.maternal || {}), greatGrandmother: e.target.value }
                                            }
                                        }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-xs text-gray-400 focus:border-blue-500/30 outline-none transition-all"
                                        placeholder="G-Grandmother"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-white/5 bg-[#141416] flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            form="edit-profile-form"
                            type="submit"
                            className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl text-white font-bold transition-all shadow-lg shadow-purple-500/20"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditProfileModal;
