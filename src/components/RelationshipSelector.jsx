import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, X } from 'lucide-react';

const RELATIONSHIPS = [
    "Father", "Mother", "Son", "Daughter", "Brother", "Sister",
    "Paternal Grandfather", "Paternal Grandmother", "Maternal Grandfather", "Maternal Grandmother",
    "Paternal Uncle", "Paternal Aunt", "Maternal Uncle", "Maternal Aunt",
    "Paternal Cousin", "Maternal Cousin",
    "Nephew", "Niece", "Grandson", "Granddaughter",
    "Husband", "Wife", "Partner", "Fiancé", "Fiancée",
    "Father-in-law", "Mother-in-law", "Brother-in-law", "Sister-in-law",
    "Friend", "Colleague", "Neighbor"
];

const RelationshipSelector = ({ isOpen, inviterName, onSelect, onClose }) => {
    const [selectedRelation, setSelectedRelation] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (selectedRelation) {
            onSelect(selectedRelation);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#1a1b1e] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Connect with {inviterName}</h2>
                        <p className="text-gray-400 text-sm">How are you related to {inviterName}?</p>
                    </div>

                    {/* Selector */}
                    <div className="space-y-4">
                        <div className="relative">
                            <select
                                value={selectedRelation}
                                onChange={(e) => setSelectedRelation(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-purple-500 appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select Relationship...</option>
                                {RELATIONSHIPS.map(rel => (
                                    <option key={rel} value={rel} className="bg-[#1a1b1e] text-white">
                                        {rel}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                ▼
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!selectedRelation}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Check size={18} /> Confirm Connection
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full text-gray-500 text-xs hover:text-white py-2"
                        >
                            Skip for now
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RelationshipSelector;
