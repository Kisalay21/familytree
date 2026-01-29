import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Camera, Video, ArrowLeft, Heart, Share2, Grid, Loader2, Briefcase, User as UserIcon, Info, Image as ImageIcon, Filter, Plus, Folder as FolderIcon, UserCheck, Trash2, X, MessageCircle, Sparkles, ChevronRight } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { processImage } from '../utils/imageProcessor';

const Profile = ({ defaultTab }) => {
    const { id: profileId } = useParams(); // Start: Get Dynamic ID
    const isReadOnly = Boolean(profileId); // If ID exists, it's a read-only visit

    const vaultRef = useRef(null);
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [storageError, setStorageError] = useState(null);

    const safeJSON = (str, fallback) => {
        try { return JSON.parse(str) || fallback; }
        catch (e) { return fallback; }
    };

    const [userDocData, setUserDocData] = useState(() => {
        const saved = localStorage.getItem('userProfile');
        const defaultData = {
            displayName: "Guest User",
            location: "",
            bio: "Welcome to your profile.",
            work: "",
            dob: "",
            gender: "",
            role: "Member",
            photoURL: null,
            coverPhoto: null,
            immediateFamily: []
        };

        let activeProfile = defaultData;

        if (saved) {
            activeProfile = { ...defaultData, ...safeJSON(saved, {}) };
        }

        // --- Read Only Mode Override ---
        // If we are visiting a member profile, find them in the family list and mock a profile for them
        if (isReadOnly && profileId) {
            const member = activeProfile.immediateFamily?.find(m => m.name === decodeURIComponent(profileId));
            if (member) {
                return {
                    ...activeProfile, // Keep base config (like family list) or maybe hide it?
                    displayName: member.name,
                    photoURL: member.img || activeProfile.photoURL,
                    role: member.relation,
                    bio: `Family member of ${activeProfile.displayName}`,
                    location: "Connected Family",
                    coverPhoto: null, // Default or null
                    immediateFamily: [] // Hide family list on member profile for now to avoid deep nesting complexity
                };
            }
        }

        // Ensure defaults if main profile
        activeProfile.fatherName = activeProfile.immediateFamily.find(m => m.relation.includes("Pita Ji"))?.name || "";
        activeProfile.motherName = activeProfile.immediateFamily.find(m => m.relation.includes("Mata Ji"))?.name || "";
        return activeProfile;
    });

    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef(null);

    useEffect(() => {
        // Only save to localStorage if it's the MAIN User (not read-only mode)
        if (!isReadOnly) {
            localStorage.setItem('userProfile', JSON.stringify(userDocData));
            window.dispatchEvent(new Event('storage'));
        }
    }, [userDocData, isReadOnly]);

    // Media Vault State
    const [mediaVault, setMediaVault] = useState(() => {
        const saved = localStorage.getItem('mediaVault');
        const defaultData = {
            folders: [
                {
                    id: '1',
                    name: 'General Memories',
                    media: []
                }
            ],
            tagged: []
        };

        return { ...defaultData, ...safeJSON(saved, {}) };
    });

    const [activeFolderId, setActiveFolderId] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null); // Lightbox Media
    const [commentInput, setCommentInput] = useState(""); // Inline comment input
    const mediaInputRef = useRef(null);

    useEffect(() => {
        try {
            localStorage.setItem('mediaVault', JSON.stringify(mediaVault));
            setStorageError(null);
        } catch (e) {
            console.error("Failed to save mediaVault", e);
            setStorageError("Warning: Storage is full. Your changes might not be saved.");
        }
    }, [mediaVault]);

    useEffect(() => {
        if (defaultTab === 'vault' && vaultRef.current) {
            vaultRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [defaultTab]);

    // Data Migration Effect: Ensure all media items have comments/likes initialized
    useEffect(() => {
        let hasChanges = false;
        const migrateMedia = (mediaList) => mediaList.map(item => {
            let changes = {};
            if (item.likes === undefined) changes.likes = 0;
            if (item.comments === undefined) changes.comments = [];
            if (!item.type) changes.type = 'image';

            if (Object.keys(changes).length > 0) {
                hasChanges = true;
                return { ...item, ...changes };
            }
            return item;
        });

        const newFolders = mediaVault.folders.map(f => ({ ...f, media: migrateMedia(f.media) }));
        const newTagged = migrateMedia(mediaVault.tagged);

        if (hasChanges) {
            setMediaVault(prev => ({ ...prev, folders: newFolders, tagged: newTagged }));
        }
    }, []); // Run once on mount

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;

        const newFolder = {
            id: Date.now().toString(),
            name: newFolderName.trim(),
            media: []
        };

        try {
            setMediaVault(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
            setNewFolderName('');
            setIsFolderModalOpen(false);
            setStorageError(null);
        } catch (e) {
            setStorageError("Failed to create folder. Storage may be full.");
        }
    };

    const handleAddMedia = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !activeFolderId) return;

        const selectedFiles = files.slice(0, 20);

        for (const file of selectedFiles) {
            try {
                const type = file.type.startsWith('image/') ? 'image' : 'video';
                let processedSrc = null;

                if (type === 'image') {
                    processedSrc = await processImage(file);
                } else {
                    // For videos, we still use FileReader for now as simple canvas resizing is for images
                    processedSrc = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                }

                const newMedia = {
                    id: Date.now() + Math.random(),
                    type,
                    src: processedSrc,
                    likes: 0,
                    comments: []
                };

                setMediaVault(prev => {
                    const nextState = {
                        ...prev,
                        folders: prev.folders.map(folder =>
                            folder.id === activeFolderId
                                ? { ...folder, media: [...folder.media, newMedia] }
                                : folder
                        )
                    };
                    localStorage.setItem('mediaVault', JSON.stringify(nextState));
                    return nextState;
                });
                setStorageError(null);
            } catch (e) {
                console.error("Upload error", e);
                setStorageError("Upload failed or storage full!");
            }
        }
    };


    const handleDeleteFolder = (folderId, folderName) => {
        if (folderName === 'General Memories') return;

        if (window.confirm(`Do you want to delete the folder "${folderName}" with all the contents inside?`)) {
            setMediaVault(prev => ({
                ...prev,
                folders: prev.folders.filter(f => f.id !== folderId)
            }));
            if (activeFolderId === folderId) {
                setActiveFolderId(null);
            }
        }
    };

    // Lightbox Interaction Handlers
    const handleLikeMedia = (mediaId, isTagged) => {
        const updateMedia = (list) => list.map(item =>
            item.id === mediaId ? { ...item, likeState: !item.likeState, likes: (item.likes || 0) + (item.likeState ? -1 : 1) } : item
        );

        setMediaVault(prev => {
            if (isTagged) {
                return { ...prev, tagged: updateMedia(prev.tagged) };
            } else {
                return {
                    ...prev,
                    folders: prev.folders.map(folder => ({
                        ...folder,
                        media: updateMedia(folder.media)
                    }))
                };
            }
        });

        // Update selected media local state to reflect change immediately in UI
        const nextLikeState = !selectedMedia?.likeState;
        const nextLikes = (selectedMedia?.likes || 0) + (nextLikeState ? 1 : -1);
        setSelectedMedia(prev => prev && prev.id === mediaId ? { ...prev, likeState: nextLikeState, likes: nextLikes } : prev);

        // --- Sync Vault Like -> Feed ---
        try {
            const savedPosts = localStorage.getItem('feedPosts');
            if (savedPosts) {
                const posts = JSON.parse(savedPosts);
                const updatedPosts = posts.map(post =>
                    String(post.vaultMediaId) === String(mediaId)
                        ? { ...post, isLiked: nextLikeState, likes: nextLikes }
                        : post
                );
                localStorage.setItem('feedPosts', JSON.stringify(updatedPosts));
            }
        } catch (e) { console.error("Sync to feed failed", e); }
    };

    const handleCommentMedia = (mediaId, isTagged) => {
        if (!commentInput.trim()) return;

        const newComment = {
            id: Date.now(),
            text: commentInput.trim(),
            author: userDocData.displayName || "Member",
            // Optimized: Don't store the full base64 avatar in every comment to save localStorage space
            avatar: userDocData.photoURL?.startsWith('data:') ? 'user-avatar' : userDocData.photoURL
        };

        const updateMediaList = (list) => list.map(item =>
            String(item.id) === String(mediaId) ? { ...item, comments: [...(item.comments || []), newComment] } : item
        );

        // 1. Update React State immediately for UI responsiveness
        setMediaVault(prev => {
            if (isTagged) {
                return { ...prev, tagged: updateMediaList(prev.tagged) };
            } else {
                return {
                    ...prev,
                    folders: prev.folders.map(folder => ({
                        ...folder,
                        media: updateMediaList(folder.media)
                    }))
                };
            }
        });

        setSelectedMedia(prev => {
            if (prev && String(prev.id) === String(mediaId)) {
                return { ...prev, comments: [...(prev.comments || []), newComment] };
            }
            return prev;
        });

        setCommentInput("");
        setStorageError(null);

        // 2. Sync Vault Comment -> Feed
        try {
            const savedPosts = localStorage.getItem('feedPosts');
            if (savedPosts) {
                const posts = JSON.parse(savedPosts);
                const feedComment = {
                    id: newComment.id.toString(),
                    author: newComment.author,
                    authorImage: userDocData.photoURL,
                    text: newComment.text,
                    timestamp: "Just now"
                };
                const updatedPosts = posts.map(post => {
                    if (String(post.vaultMediaId) === String(mediaId)) {
                        const updatedList = [...(post.commentsList || []), feedComment];
                        return { ...post, comments: updatedList.length, commentsList: updatedList };
                    }
                    return post;
                });
                localStorage.setItem('feedPosts', JSON.stringify(updatedPosts));
            }
        } catch (e) { console.error("Sync comment to feed failed", e); }
    };

    const handleDeleteMedia = (mediaId, isTagged) => {
        if (!confirm("Are you sure you want to delete this memory forever?")) return;

        setMediaVault(prev => {
            if (isTagged) {
                return { ...prev, tagged: prev.tagged.filter(item => item.id !== mediaId) };
            } else {
                return {
                    ...prev,
                    folders: prev.folders.map(folder => ({
                        ...folder,
                        media: folder.media.filter(item => item.id !== mediaId)
                    }))
                };
            }
        });
        setSelectedMedia(null); // Close lightbox
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            const processedSrc = await processImage(file, 400); // Smaller for avatar
            setUserDocData(prev => ({ ...prev, photoURL: processedSrc }));
        } catch (e) {
            console.error("Avatar upload failed", e);
            setStorageError("Failed to update avatar.");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveProfile = (formData) => {
        setUserDocData(prev => {
            let updatedFamily = [...(prev.immediateFamily || [])];
            let updatedHeritage = { ...(prev.heritage || {}), ...formData.heritage };

            if (formData.fatherName) {
                const idx = updatedFamily.findIndex(m => m.relation.includes("Pita Ji"));
                if (idx >= 0) updatedFamily[idx].name = formData.fatherName;
                updatedHeritage.father = formData.fatherName;
            }
            if (formData.motherName) {
                const idx = updatedFamily.findIndex(m => m.relation.includes("Mata Ji"));
                if (idx >= 0) updatedFamily[idx].name = formData.motherName;
                updatedHeritage.mother = formData.motherName;
            }
            return {
                ...prev,
                ...formData,
                heritage: updatedHeritage,
                immediateFamily: updatedFamily,
                lastUpdated: Date.now()
            };
        });
    };

    const displayAvatar = userDocData.photoURL || null;

    return (
        <div className="min-h-screen pb-20 text-white overflow-x-hidden pt-10">
            {/* Create Folder Modal */}
            <AnimatePresence>
                {isFolderModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsFolderModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-[#0f0f16] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />

                            <h2 className="text-2xl font-black text-white mb-2">New Folder</h2>
                            <p className="text-gray-400 text-sm mb-6">Create a special space for your family memories.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 tracking-widest">Folder Name</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                        placeholder="e.g. LOLO wedding"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={handleCreateFolder}
                                    disabled={!newFolderName.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Create Dimension
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveProfile}
                initialData={{
                    ...userDocData,
                    fatherName: userDocData.heritage?.father || userDocData.immediateFamily?.find(m => m.relation.includes("Pita Ji"))?.name || "",
                    motherName: userDocData.heritage?.mother || userDocData.immediateFamily?.find(m => m.relation.includes("Mata Ji"))?.name || ""
                }}
            />

            {/* Lightbox Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <button
                        onClick={() => setSelectedMedia(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="max-w-5xl w-full flex flex-col md:flex-row gap-6 h-[80vh]">
                        {/* Media Display */}
                        <div className="flex-1 flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden border border-white/10 relative group">
                            {selectedMedia.type === 'video' ? (
                                <video src={selectedMedia.src} controls className="max-w-full max-h-full object-contain" />
                            ) : (
                                <img src={selectedMedia.src} alt="Full view" className="max-w-full max-h-full object-contain" />
                            )}

                            {/* Delete Button (Overlay) */}
                            <button
                                onClick={() => handleDeleteMedia(selectedMedia.id, selectedMedia.isTagged)}
                                className="absolute bottom-4 right-4 p-3 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Forever"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Interactions Sidebar */}
                        <div className="w-full md:w-80 bg-gray-900/80 rounded-2xl border border-white/10 flex flex-col">
                            <div className="p-4 border-b border-white/10">
                                <h3 className="font-bold text-white">Memory Details</h3>
                                {selectedMedia.taggedBy && <p className="text-xs text-cyan-400 mt-1">Tagged by {selectedMedia.taggedBy}</p>}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {selectedMedia.comments && selectedMedia.comments.length > 0 ? (
                                    selectedMedia.comments.map((comment, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                                {comment.avatar ? (
                                                    <img
                                                        src={comment.avatar === 'user-avatar' ? displayAvatar : comment.avatar}
                                                        className="w-full h-full object-cover"
                                                        alt={comment.author}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-xs">{(comment.author || "U").charAt(0)}</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{comment.author}</p>
                                                <p className="text-xs text-gray-300">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-500 text-sm">No comments yet.</div>
                                )}
                            </div>

                            {storageError && (
                                <div className="px-4 py-2 bg-red-500/20 text-red-400 text-xs text-center border-t border-red-500/20">
                                    {storageError}
                                </div>
                            )}

                            <div className="p-4 border-t border-white/10 flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        placeholder="Type a comment..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-cyan-500 outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleCommentMedia(selectedMedia.id, selectedMedia.isTagged)}
                                    />
                                    <button
                                        onClick={() => handleCommentMedia(selectedMedia.id, selectedMedia.isTagged)}
                                        disabled={!commentInput.trim()}
                                        className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleLikeMedia(selectedMedia.id, selectedMedia.isTagged)}
                                    className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors ${selectedMedia.likeState ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                                >
                                    <Heart className={`w-4 h-4 ${selectedMedia.likeState ? 'fill-current' : ''}`} />
                                    {selectedMedia.likes || 0} Likes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Profile Header Section */}
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-12 relative py-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Glowing Avatar */}
                        <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                            <input type="file" ref={avatarInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-cyan-400/50 to-purple-500 z-0"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                            <div className="w-44 h-44 rounded-full p-1.5 bg-gradient-to-tr from-purple-600 to-cyan-500 relative z-10 shadow-2xl overflow-hidden flex items-center justify-center bg-black">
                                {displayAvatar ? (
                                    <img src={displayAvatar} alt="Profile" className={`w-full h-full rounded-full object-cover border-4 border-[#050505] transition-opacity ${isUploadingAvatar ? 'opacity-50' : 'opacity-100'}`} />
                                ) : (
                                    <span className="text-5xl font-bold text-white uppercase">{userDocData.displayName?.charAt(0) || "U"}</span>
                                )}
                                <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-[#050505] rounded-full z-20"></div>
                                {isUploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-30">
                                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left pt-4">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-4xl font-black text-white text-glow">{userDocData.displayName}</h1>
                                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                    {userDocData.role}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 text-sm mb-4">
                                <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-4 h-4 text-cyan-400" /> {userDocData.location}</span>
                                <span className="flex items-center gap-1.5 font-medium"><Briefcase className="w-4 h-4 text-green-400" /> {userDocData.work}</span>
                            </div>

                            <p className="text-gray-300 max-w-2xl text-base leading-relaxed border-l-2 border-purple-500/50 pl-4 py-1 italic mx-auto md:mx-0">
                                "{userDocData.bio}"
                            </p>
                        </div>
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center gap-3 self-center md:self-end mb-4">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-xl hover:scale-105 active:scale-95 text-sm"
                        >
                            Edit Profile
                        </button>
                        <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white hover:text-cyan-400">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Immediate Family */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                <Heart className="w-32 h-32 text-pink-500" />
                            </div>

                            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                <span className="p-1.5 bg-pink-500/20 rounded-lg"><Heart className="w-4 h-4 text-pink-500" fill="currentColor" /></span>
                                Immediate Family
                            </h2>
                            <div className="space-y-4">
                                {userDocData.immediateFamily?.map((member, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2.5 -mx-2 rounded-2xl transition-all border border-transparent hover:border-white/5">
                                        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400/50 via-purple-400/50 to-amber-400/50 group-hover:from-cyan-400 overflow-hidden flex items-center justify-center bg-black">
                                            {member.img ? (
                                                <img src={member.img} alt={member.name} className="w-full h-full rounded-full object-cover border-2 border-[#0a0a0c]" />
                                            ) : (
                                                <span className="text-lg font-bold text-white">{member.name?.charAt(0) || "?"}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{member.name}</h3>
                                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{member.relation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Media Vault */}
                    <div className="lg:col-span-8 space-y-6" ref={vaultRef}>
                        <div className="glass-panel p-8 rounded-3xl border border-white/10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                <h2 className="text-xl font-black text-white flex items-center gap-3">
                                    <span className="p-2 bg-purple-500/20 rounded-xl"><Grid className="w-5 h-5 text-purple-400" /></span>
                                    Media Vault
                                </h2>


                                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                                    {['All', 'Tagged'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => {
                                                setActiveFilter(filter);
                                                setActiveFolderId(null);
                                            }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilter === filter ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {storageError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
                                >
                                    <Info size={18} />
                                    {storageError}
                                    <button onClick={() => setStorageError(null)} className="ml-auto opacity-50 hover:opacity-100"><X size={14} /></button>
                                </motion.div>
                            )}

                            {activeFilter === 'Tagged' ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {mediaVault.tagged.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedMedia({ ...item, isTagged: true })} // Open Lightbox
                                            className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5"
                                        >
                                            <img src={item.src} alt="Tagged" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                <p className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
                                                    <UserCheck className="w-3 h-3 text-cyan-400" /> Tagged by
                                                </p>
                                                <p className="text-xs text-gray-300 mt-0.5">{item.taggedBy}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {mediaVault.tagged.length === 0 && (
                                        <p className="col-span-full text-center text-gray-500 py-10">No tagged photos yet.</p>
                                    )}
                                </div>
                            ) : !activeFolderId ? (
                                /* Folders View */
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Create Folder Button */}
                                    <button
                                        onClick={() => setIsFolderModalOpen(true)}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
                                    >
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                                            <FolderIcon className="w-6 h-6 text-gray-500 group-hover:text-purple-400" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-purple-400 uppercase tracking-widest">New Folder</span>
                                    </button>

                                    {mediaVault.folders.map((folder) => (
                                        <div
                                            key={folder.id}
                                            onClick={() => setActiveFolderId(folder.id)}
                                            className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col justify-between hover:bg-white/10 cursor-pointer transition-all group relative overflow-hidden"
                                        >
                                            {folder.name !== 'General Memories' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFolder(folder.id, folder.name);
                                                    }}
                                                    className="absolute top-3 right-3 p-2 bg-red-500/20 hover:bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 active:scale-95"
                                                    title="Delete Folder"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <FolderIcon className="w-20 h-20 text-white transform rotate-12" />
                                            </div>

                                            <div className="flex -space-x-2 overflow-hidden py-2">
                                                {folder.media.slice(0, 3).map((m, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full border border-black bg-gray-800 overflow-hidden">
                                                        <img src={m.src} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {folder.media.length === 0 && <div className="w-8 h-8 rounded-full border border-black bg-gray-800 flex items-center justify-center text-[10px] text-gray-500">0</div>}
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors truncate">{folder.name}</h3>
                                                <p className="text-xs text-gray-500">{folder.media.length} items</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Inside Folder View */
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <button
                                            onClick={() => setActiveFolderId(null)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-white" />
                                        </button>
                                        <h3 className="text-lg font-bold text-white">
                                            {mediaVault.folders.find(f => f.id === activeFolderId)?.name}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {/* Add Media Button (Batch Supported) */}
                                        <button
                                            onClick={() => mediaInputRef.current?.click()}
                                            className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
                                        >
                                            <input type="file" ref={mediaInputRef} onChange={handleAddMedia} accept="image/*,video/*" multiple className="hidden" />
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                                                <Plus className="w-6 h-6 text-gray-500 group-hover:text-cyan-400" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 group-hover:text-cyan-400 uppercase tracking-widest">Add Photos</span>
                                        </button>

                                        {mediaVault.folders.find(f => f.id === activeFolderId)?.media.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedMedia(item)} // Open Lightbox
                                                className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5"
                                            >
                                                {item.type === 'video' ? (
                                                    <video src={item.src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <img src={item.src} alt="Memory" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
