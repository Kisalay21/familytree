import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Heart, Share2, Info, ZoomIn, ZoomOut } from 'lucide-react';

const FamilyNode = ({ member, x, y, parentX, parentY, delay, isRoot, onSelect, isActive, isPaternal, isMaternal }) => {
    // Calculate relative position of parent from this node
    const relX = (parentX || 0) - x;
    const relY = (parentY || 0) - y;

    // Calculate gap (radius of node + buffer)
    // Node is w-16/w-20 (approx 4rem = 64px, radius 32px). Let's say 40px gap.
    const angle = Math.atan2(relY, relX);
    const gap = 45; // radius + spacing

    // Line start (at parent, offset by gap)
    const x1 = relX - Math.cos(angle) * gap;
    const y1 = relY - Math.sin(angle) * gap;

    // Line end (at child, offset by gap) (Child is at 0,0 locally)
    const x2 = Math.cos(angle) * gap; // Actually strictly speaking, we want to stop at the child's edge.
    // Since Vector points Parent -> Child (in relative terms Parent is relX, Child is 0)
    // Wait, relX/Y is vector FROM Child TO Parent.
    // So 0,0 is Child. relX,relY is Parent.

    // We want line from ParentEdge to ChildEdge.
    // Vector Child->Parent is (relX, relY).
    // Start Point (at Parent Edge): ParentPos - (Gap * normalizedVector)
    // ParentPos is (relX, relY).
    // dx/dy is component of Gap towards Child. -cos(angle)*gap, -sin(angle)*gap.
    const startX = relX - Math.cos(angle) * gap;
    const startY = relY - Math.sin(angle) * gap;

    // End Point (at Child Edge): ChildPos + (Gap * normalizedVector)
    // ChildPos is (0,0).
    // Direction Child->Parent is angle.
    const endX = Math.cos(angle) * gap;
    const endY = Math.sin(angle) * gap;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, x, y }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay
            }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            className="absolute cursor-pointer group"
            onClick={() => onSelect(member)}
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
            {/* Connection Line to Parent */}
            {!isRoot && (
                <svg className="absolute pointer-events-none overflow-visible" style={{ left: 0, top: 0, width: 0, height: 0 }}>
                    <motion.line
                        initial={{ pathLength: 0 }}
                        animate={{
                            pathLength: 1,
                            stroke: isActive ? (isPaternal ? '#a855f7' : '#06b6d4') : 'rgba(139, 92, 246, 0.3)',
                            strokeWidth: isActive ? 4 : 2,
                            opacity: isActive ? 1 : 0.5
                        }}
                        transition={{ duration: 1, delay: delay + 0.5 }}
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        strokeDasharray={isActive ? "none" : "5,5"}
                    />
                    {/* Pulsing highlight for active path */}
                    {isActive && (
                        <motion.line
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke={isPaternal ? '#a855f7' : '#06b6d4'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            style={{ filter: 'blur(8px)' }}
                        />
                    )}
                </svg>
            )}

            {/* Aura/Glow */}
            <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${isActive ? (isPaternal ? 'bg-purple-500/60' : 'bg-cyan-500/60') :
                (isPaternal ? 'bg-purple-500/20 group-hover:bg-purple-500/40' : 'bg-cyan-500/20 group-hover:bg-cyan-500/40')
                }`} />

            {/* Node Content */}
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 bg-[#0a0a0c]/80 backdrop-blur-md flex items-center justify-center p-1 transition-all duration-500 shadow-2xl ${isActive ? (isPaternal ? 'border-purple-500 scale-110 shadow-purple-500/50' : 'border-cyan-500 scale-110 shadow-cyan-500/50') :
                'border-white/10 group-hover:border-white/30'
                }`}>
                <div className="w-full h-full rounded-full overflow-hidden border border-white/5">
                    <img
                        src={member.image || `https://images.unsplash.com/photo-${1500000000000 + member.id}?auto=format&fit=crop&w=100&q=80`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Floating Badge */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + 0.8 }}
                    className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/20 shadow-lg ${isPaternal ? 'bg-purple-600' : 'bg-cyan-600'
                        }`}
                >
                    {member.relation[0]}
                </motion.div>
            </div>

            {/* Name Tag */}
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <div className={`text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{member.name}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{member.relation}</div>
            </div>
        </motion.div>
    );
};

const FamilyTree = () => {
    const navigate = useNavigate();
    const [selectedMember, setSelectedMember] = useState(null);
    const [zoom, setZoom] = useState(1);

    // Drag Motion Values (for Tether calculation)
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

    // Update state on drag for React re-render (smooth enough for the line)
    const handleDrag = () => {
        setDragPos({ x: dragX.get(), y: dragY.get() });
    };

    const safeJSON = (str, fallback) => {
        try { return JSON.parse(str) || fallback; }
        catch (e) { return fallback; }
    };

    // Load User Profile from localStorage (Sync with Dashboard/Profile)
    const [userProfile] = useState(() => {
        const saved = localStorage.getItem('userProfile');
        return safeJSON(saved, {
            displayName: "John Doe",
            photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
        });
    });

    const [stats, setStats] = useState({ posts: 0, vaults: 0 });

    useEffect(() => {
        // Load real counts from storage
        const loadStats = () => {
            const posts = safeJSON(localStorage.getItem('feedPosts'), []);
            const vault = safeJSON(localStorage.getItem('mediaVault'), { folders: [] });

            // For now, these represent the "Dimension" activity 
            // In a full system, we'd filter posts by the selected member's ID
            setStats({
                posts: posts.length,
                vaults: vault.folders?.length || 0
            });
        };

        loadStats();
        window.addEventListener('storage', loadStats);
        return () => window.removeEventListener('storage', loadStats);
    }, []);

    // List of relations to include in the tree if they exist in user profile
    const getFamilyData = () => {
        const nodes = [];
        const heritage = userProfile.heritage || {};

        // Root Node
        nodes.push({
            id: 'root',
            name: "YOU",
            fullName: userProfile.displayName,
            relation: "Self",
            image: userProfile.photoURL,
            x: 0,
            y: 0,
            isRoot: true
        });

        // Generations Configuration
        const levelY = -120; // Vertical spacing between generations
        const spreadX = 220; // Horizontal spread

        // --- PATERNAL SIDE (Positive X) ---
        if (heritage.father) {
            nodes.push({
                id: 'father',
                name: heritage.father,
                relation: 'Father',
                x: spreadX / 2,
                y: levelY,
                parentId: 'root',
                isPaternal: true
            });

            if (heritage.paternal?.grandfather) {
                nodes.push({
                    id: 'patGF',
                    name: heritage.paternal.grandfather,
                    relation: 'Grandfather',
                    x: spreadX / 2 + 80,
                    y: levelY * 2,
                    parentId: 'father',
                    isPaternal: true
                });

                if (heritage.paternal?.greatGrandfather) {
                    nodes.push({
                        id: 'patGGF',
                        name: heritage.paternal.greatGrandfather,
                        relation: 'Great-Grandfather',
                        x: spreadX / 2 + 140,
                        y: levelY * 3,
                        parentId: 'patGF',
                        isPaternal: true
                    });
                }
            }

            if (heritage.paternal?.grandmother) {
                nodes.push({
                    id: 'patGM',
                    name: heritage.paternal.grandmother,
                    relation: 'Grandmother',
                    x: spreadX / 2 - 80,
                    y: levelY * 2,
                    parentId: 'father',
                    isPaternal: true
                });

                if (heritage.paternal?.greatGrandmother) {
                    nodes.push({
                        id: 'patGGM',
                        name: heritage.paternal.greatGrandmother,
                        relation: 'Great-Grandmother',
                        x: spreadX / 2 - 140,
                        y: levelY * 3,
                        parentId: 'patGM',
                        isPaternal: true
                    });
                }
            }
        }

        // --- MATERNAL SIDE (Negative X) ---
        if (heritage.mother) {
            nodes.push({
                id: 'mother',
                name: heritage.mother,
                relation: 'Mother',
                x: -spreadX / 2,
                y: levelY,
                parentId: 'root',
                isMaternal: true
            });

            if (heritage.maternal?.grandfather) {
                nodes.push({
                    id: 'matGF',
                    name: heritage.maternal.grandfather,
                    relation: 'Grandfather',
                    x: -spreadX / 2 - 80,
                    y: levelY * 2,
                    parentId: 'mother',
                    isMaternal: true
                });

                if (heritage.maternal?.greatGrandfather) {
                    nodes.push({
                        id: 'matGGF',
                        name: heritage.maternal.greatGrandfather,
                        relation: 'Great-Grandfather',
                        x: -spreadX / 2 - 140,
                        y: levelY * 3,
                        parentId: 'matGF',
                        isMaternal: true
                    });
                }
            }

            if (heritage.maternal?.grandmother) {
                nodes.push({
                    id: 'matGM',
                    name: heritage.maternal.grandmother,
                    relation: 'Grandmother',
                    x: -spreadX / 2 + 80,
                    y: levelY * 2,
                    parentId: 'mother',
                    isMaternal: true
                });

                if (heritage.maternal?.greatGrandmother) {
                    nodes.push({
                        id: 'matGGM',
                        name: heritage.maternal.greatGrandmother,
                        relation: 'Great-Grandmother',
                        x: -spreadX / 2 + 140,
                        y: levelY * 3,
                        parentId: 'matGM',
                        isMaternal: true
                    });
                }
            }
        }

        // Add any additional immediate family from the old system (if they aren't parents)
        const immediateFamily = (userProfile.immediateFamily || []).filter(m =>
            !m.relation.includes('Father') && !m.relation.includes('Mother')
        );

        immediateFamily.forEach((m, idx) => {
            const angle = (idx * (360 / Math.max(1, immediateFamily.length))) * (Math.PI / 180);
            nodes.push({
                id: `extra-${idx}`,
                name: m.name,
                relation: m.relation,
                x: Math.cos(angle) * 160,
                y: Math.sin(angle) * 80 + 100, // Position below the root
                image: m.img
            });
        });

        return nodes;
    };

    const familyData = getFamilyData();

    return (
        <div className="min-h-screen bg-transparent pt-4 pb-20 px-6 relative overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start">
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Description - Now in normal flow for better alignment control */}
            <div className="w-full max-w-2xl px-6 text-center z-10 mb-2 relative">
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-400 text-[10px] font-medium tracking-wide uppercase opacity-80"
                >
                    interactive visualization of your lineage. click member to explore their digital memories and connections
                </motion.p>

                {/* Perpendicular Visual Guide */}
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 40, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full w-px bg-gradient-to-b from-purple-500/50 to-transparent"
                />
            </div>

            {/* Zoomable Container */}
            <div
                className="max-w-7xl w-full relative h-[600px] flex items-center justify-center mt-24 transition-transform duration-200 ease-out origin-top"
                style={{ transform: `scale(${zoom})` }}
            >
                {/* Draggable Canvas */}
                <motion.div
                    drag
                    dragMomentum={false}
                    style={{ x: dragX, y: dragY }}
                    onDrag={handleDrag}
                    className="w-full h-full relative cursor-move active:cursor-grabbing touch-none flex items-center justify-center"
                >
                    {/* Visual Connector Infrastructure (SVG Layer) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <defs>
                            <radialGradient id="lineGradient">
                                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
                            </radialGradient>
                        </defs>
                    </svg>

                    {/* Family Nodes */}
                    {familyData.map((member, index) => {
                        const parent = familyData.find(p => p.id === member.parentId);
                        return (
                            <FamilyNode
                                key={member.id}
                                member={member}
                                x={member.x}
                                y={member.y}
                                parentX={parent?.x || 0}
                                parentY={parent?.y || 0}
                                isRoot={member.isRoot}
                                delay={index * 0.1}
                                onSelect={setSelectedMember}
                                isActive={selectedMember?.id === member.id}
                                isPaternal={member.isPaternal}
                                isMaternal={member.isMaternal}
                            />
                        );
                    })}

                    {/* Central Focus Effect */}
                    <div className="absolute w-32 h-32 border border-purple-500/10 rounded-full animate-ping pointer-events-none" />
                </motion.div>
            </div>

            {/* Visual Tether Line (Overlay) */}
            {selectedMember && (
                <svg className="fixed inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                    <line
                        x1={`calc(50% + ${(selectedMember.x * zoom) + dragPos.x}px)`}
                        y1={`calc(50% + ${(selectedMember.y * zoom) + dragPos.y + 96}px)`} // +96px for top-margin offset
                        x2="100%"
                        y2="50%" // Rough target to the sidebar center
                        className="stroke-purple-500/30"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                    {/* Animated dot moving slightly towards sidebar */}
                    <circle r="3" fill="#a855f7">
                        <animateMotion
                            dur="2s"
                            repeatCount="indefinite"
                            path={`M${(window.innerWidth / 2) + (selectedMember.x * zoom) + dragPos.x},${(300 + 96) + (selectedMember.y * zoom) + dragPos.y} L${window.innerWidth},${window.innerHeight / 2}`}
                        />
                    </circle>
                </svg>
            )}

            {/* Zoom Controls (Portaled to stay fixed) */}
            {createPortal(
                <div className="fixed bottom-6 left-6 z-[100] bg-[#0a0a0c]/90 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl">
                    <button
                        onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <input
                        type="range"
                        min="0.4"
                        max="1.5"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                    />
                    <button
                        onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ZoomIn size={18} />
                    </button>
                    <span className="text-[10px] w-8 text-center text-gray-500 font-mono">{Math.round(zoom * 100)}%</span>
                </div>,
                document.body
            )}



            {/* Member Details Panel (Portaled for fixed access) */}
            {createPortal(
                <AnimatePresence>
                    {selectedMember && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="fixed right-6 top-24 bottom-24 w-80 bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-3xl z-[100] shadow-2xl p-6 overflow-y-auto"
                        >
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <Plus className="rotate-45" size={24} />
                            </button>

                            <div className="flex flex-col items-center text-center mt-4">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-purple-500 shadow-lg shadow-purple-500/20 mb-4">
                                    <img
                                        src={selectedMember.image || `https://images.unsplash.com/photo-${1500000000000 + selectedMember.id}?auto=format&fit=crop&w=200&q=80`}
                                        alt={selectedMember.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-white">{selectedMember.name === "YOU" ? selectedMember.fullName : selectedMember.name}</h2>
                                <p className="text-purple-400 text-sm font-medium">{selectedMember.name === "YOU" ? "Your Profile" : selectedMember.relation}</p>

                                <div className="grid grid-cols-2 gap-3 w-full mt-8">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Posts</div>
                                        <div className="text-white font-bold text-lg">
                                            {selectedMember.id === 'root' ? stats.posts : Math.floor(stats.posts * 0.8) + (selectedMember.id.length % 5)}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Vaults</div>
                                        <div className="text-white font-bold text-lg">
                                            {selectedMember.id === 'root' ? stats.vaults : Math.floor(stats.vaults * 0.5) + (selectedMember.id.length % 3)}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full mt-8 space-y-3">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <User size={16} /> VIEW PROFILE
                                    </button>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        <Heart size={16} /> SHARED MEMORIES
                                    </button>
                                </div>

                                <div className="mt-8 p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl w-full text-left">
                                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                                        <Info size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">About</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed italic">
                                        "{selectedMember.name === "YOU" ? (userProfile.bio || "No bio available.") : `Always cherished the summer trips to the lake house. A pillar of the ${selectedMember.name.split(' ').pop()} family.`}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default FamilyTree;
