import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Atom, Search, Bell, Sparkles, Users, ChevronRight, Image as ImageIcon, X, Trash2, Bookmark, Flag, Link as LinkIcon, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processImage } from '../utils/imageProcessor';
import Logo from '../components/Logo';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const Dashboard = () => {
    const navigate = useNavigate();

    const safeJSON = (str, fallback) => {
        try { return JSON.parse(str) || fallback; }
        catch (e) { return fallback; }
    };

    // Load User Profile with Birthday Migration
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('userProfile');
        let profile = safeJSON(saved, {
            displayName: "John Doe",
            photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
        });

        // Data Migration: Ensure Family Members have DOBs
        let hasChanges = false;
        if (profile.immediateFamily) {
            profile.immediateFamily = profile.immediateFamily.map(member => {
                if (!member.dob) {
                    hasChanges = true;
                    // Assign random DOB for demo purposes (Age 20-60)
                    const randomAge = Math.floor(Math.random() * 40) + 20;
                    const randomMonth = Math.floor(Math.random() * 12); // 0-11
                    const randomDay = Math.floor(Math.random() * 28) + 1; // 1-28 safe
                    const year = new Date().getFullYear() - randomAge;
                    // Format: YYYY-MM-DD
                    const dob = `${year}-${String(randomMonth + 1).padStart(2, '0')}-${String(randomDay).padStart(2, '0')}`;
                    return { ...member, dob };
                }
                return member;
            });
        }

        if (hasChanges) {
            localStorage.setItem('userProfile', JSON.stringify(profile));
        }

        return profile;
    });

    const displayName = userProfile?.displayName || "Member";
    const photoURL = userProfile?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80";

    // Dynamic Family Directory from User Profile
    const familyDirectory = [
        {
            title: "My Connections",
            members: (userProfile.immediateFamily || []).map((member, idx) => ({
                name: member.name,
                title: member.relation,
                status: idx % 2 === 0 ? "online" : "offline" // Mock status for liveliness
            }))
        }
    ];


    // Real Upcoming Birthday Logic
    const getUpcomingBirthday = () => {
        const family = userProfile.immediateFamily || [];
        if (family.length === 0) return null;

        const today = new Date();
        const upcoming = family.map(member => {
            if (!member || !member.dob) return null;
            const birthDate = new Date(member.dob);
            if (isNaN(birthDate.getTime())) return null;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBday < today) {
                nextBday.setFullYear(today.getFullYear() + 1);
            }

            const diffTime = nextBday.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let age = today.getFullYear() - birthDate.getFullYear();
            if (nextBday.getFullYear() > today.getFullYear()) age++;

            return {
                name: member.name,
                relation: member.relation,
                daysUntil: diffDays,
                nextBirthday: nextBday,
                turningAge: age
            };
        }).filter(b => b !== null);

        upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
        return upcoming[0] || null;
    };

    // Calculate this outside render or memoize it
    const nextBirthday = React.useMemo(() => getUpcomingBirthday(), [userProfile.immediateFamily]);

    // State for Feed Posts (Firestore Realtime)
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        // Subscribe to posts collection
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(fetchedPosts);
            setLoadingPosts(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setPostError("Failed to load live feed.");
            setLoadingPosts(false);
        });

        return () => unsubscribe();
    }, []);

    // State for Recent Activity (Persistent)
    const [activities, setActivities] = useState(() => {
        const savedActivities = localStorage.getItem('recentActivities');
        try {
            const parsed = savedActivities ? JSON.parse(savedActivities) : [];
            // Filter out old fake activities (which had string timestamps like "Just now")
            // Only keep activities with valid numeric timestamps
            return parsed.filter(a => typeof a.timestamp === 'number' && !isNaN(a.timestamp));
        } catch (e) {
            return [];
        }
    });

    const [newPostContent, setNewPostContent] = useState('');
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const fileInputRef = useRef(null);

    // State for Storage Error
    const [postError, setPostError] = useState(null);

    // State for active dropdown menu
    const [activeMenuPostId, setActiveMenuPostId] = useState(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuPostId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleMenuAction = (e, action, post) => {
        e.stopPropagation();
        setActiveMenuPostId(null);

        switch (action) {
            case 'share':
                handleShare();
                break;
            case 'save':
                // Mock Save
                alert(`Post by ${post.author} saved to your collection!`);
                break;
            case 'notify':
                // Mock Notification Toggle
                alert(`Notifications turned on for ${post.author}'s posts.`);
                break;
            case 'report':
                // Mock Report
                if (window.confirm("Report this post for violating community guidelines?")) {
                    alert("Thank you. We have received your report.");
                }
                break;
            case 'copylink':
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
                break;
            default:
                break;
        }
    };

    // LocalStorage sync removed for Posts (now using Firestore)
    // Activities still local for now

    // Save activities to LocalStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('recentActivities', JSON.stringify(activities));
        } catch (e) { console.error("Failed to save activities", e); }
    }, [activities]);

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const type = file.type.startsWith('image/') ? 'image' : 'video';
        setMediaType(type);

        try {
            if (type === 'image') {
                const processedSrc = await processImage(file);
                setMediaPreview(processedSrc);
            } else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
            setPostError(null);
        } catch (e) {
            console.error("File processing failed", e);
            setPostError("Failed to process media.");
        }
    };

    const handleRemoveMedia = () => {
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Helper: Format Time Ago
    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return "Just now";
    };

    const handlePostUpdate = async () => {
        try {
            if (!newPostContent.trim() && !mediaPreview) return;

            // We let Firestore generate the ID, but we need a timestamp for sorting
            // Using ISO string for display, but serverTimestamp() is better for sorting (keeping simple for now)
            const timestamp = new Date().toISOString();
            const displayTimestamp = new Date().toLocaleString();

            let vaultMediaId = null;

            // 1. Prepare Vault Mirroring (Legacy LocalStorage Support)
            // ... (Vault logic kept as-is for now) ...
            if (mediaPreview) {
                try {
                    vaultMediaId = Date.now() + Math.random();
                    const savedVault = localStorage.getItem('mediaVault');
                    const vault = (savedVault && savedVault !== 'undefined') ? JSON.parse(savedVault) : { folders: [], tagged: [] };
                    // ... (rest of vault logic simplified for brevity in this replacement, assuming user wants functionality)
                    if (!vault.folders) vault.folders = [];
                    let generalFolder = vault.folders.find(f => f.name === 'General Memories');
                    if (!generalFolder) {
                        generalFolder = { id: '1', name: 'General Memories', media: [] };
                        vault.folders.push(generalFolder);
                    }
                    if (!generalFolder.media) generalFolder.media = [];

                    const newMedia = {
                        id: vaultMediaId,
                        type: mediaType,
                        src: mediaPreview,
                        likes: 0,
                        comments: [{
                            id: Date.now(),
                            text: "Shared from my feed!",
                            author: displayName,
                            avatar: 'user-avatar'
                        }]
                    };
                    generalFolder.media.unshift(newMedia);
                    localStorage.setItem('mediaVault', JSON.stringify(vault));
                } catch (e) {
                    console.error("Auto-mirroring failed", e);
                }
            }

            // 2. Create Post Object for Firestore
            const newPost = {
                vaultMediaId: vaultMediaId,
                authorId: userProfile?.uid || "legacy-user", // Use UID from profile if available
                author: displayName,
                authorImage: photoURL,
                relationship: "You",
                content: newPostContent,
                image: mediaType === 'image' ? mediaPreview : null, // Note: storing base64 in Firestore is bad practice, but good for MVP. Phase 4 is Storage.
                video: mediaType === 'video' ? mediaPreview : null,
                timestamp: timestamp, // Sortable
                displayTime: displayTimestamp, // Readable
                likes: 0,
                comments: 0,
                commentsList: [],
                isLiked: false
            };

            await addDoc(collection(db, "posts"), newPost);

            // Reset UI
            setNewPostContent('');
            handleRemoveMedia();
            setPostError(null);

            // 3. Log User Action (Real Activity)
            const userActivity = {
                id: Date.now().toString(),
                type: 'post',
                actor: 'You',
                text: 'shared a memory.',
                timestamp: Date.now(),
                icon: "heart"
            };
            setActivities(prev => [userActivity, ...prev].slice(0, 10));

        } catch (criticalError) {
            console.error("Critical Post Error", criticalError);
            setPostError("Failed to post. Check connection.");
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("Are you sure you want to delete this post from your feed?")) {
            try {
                await deleteDoc(doc(db, "posts", postId));
                // No need to setPosts, the onSnapshot listener will handle it
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post.");
            }
        }
    };

    // Post Interactions
    const handleLike = async (postId) => {
        const targetPost = posts.find(p => p.id === postId);
        if (!targetPost) return;

        // Simple toggle for MVP (Warning: Shared state in real app)
        const willLike = !targetPost.isLiked;
        const newLikes = (targetPost.likes || 0) + (willLike ? 1 : -1);

        try {
            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, {
                isLiked: willLike,
                likes: newLikes
            });

            // Log Like Activity
            if (willLike) {
                // ... Activity Logging (Keep Local for now or move to separate collection later)
            }
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };

    const handleComment = async (postId) => {
        const commentText = window.prompt("Add a comment:");
        if (commentText) {
            const newComment = {
                id: Date.now().toString(),
                author: displayName,
                authorImage: photoURL,
                text: commentText,
                timestamp: Date.now()
            };

            try {
                const targetPost = posts.find(p => p.id === postId);
                const updatedCommentsList = [...(targetPost.commentsList || []), newComment];

                const postRef = doc(db, "posts", postId);
                await updateDoc(postRef, {
                    commentsList: updatedCommentsList,
                    comments: updatedCommentsList.length
                });

                // Log interaction
                // ...
            } catch (error) {
                console.error("Error adding comment:", error);
            }
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm("Delete this comment?")) return;

        try {
            const targetPost = posts.find(p => p.id === postId);
            const updatedCommentsList = (targetPost.commentsList || []).filter(c => c.id !== commentId);

            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, {
                commentsList: updatedCommentsList,
                comments: updatedCommentsList.length
            });
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    };


    const handleViewProfile = () => {
        navigate('/profile');
    };


    const handleViewMessages = () => {
        // Future implementation
        console.log("View Messages");
    };

    return (
        <div className="container mx-auto px-4 pt-4 pb-10 flex flex-col lg:flex-row gap-8 max-w-7xl relative z-10">
            {/* Background Watermark */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <div className="opacity-[0.05] scale-[20] transform origin-center">
                    <Logo />
                </div>
            </div>

            {/* Left Sidebar - Family Directory */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
                {/* User Mini Profile Card */}
                <div
                    onClick={handleViewProfile}
                    className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group"
                >
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                            <img src={photoURL} alt="User" className="w-full h-full rounded-full object-cover border border-black" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm truncate group-hover:text-purple-400 transition-colors">{displayName}</h3>
                        <p className="text-xs text-gray-400">View Profile</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                {/* 3D Galaxy Button */}

                {/* Directory */}
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" /> Family Directory
                    </h2>

                    <div className="space-y-6">
                        {familyDirectory.map((group, idx) => (
                            <div key={idx}>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{group.title}</h3>
                                <div className="space-y-3">
                                    {group.members.map((member, mIdx) => (
                                        <div
                                            key={mIdx}
                                            onClick={() => navigate(`/profile/${encodeURIComponent(member.name)}`)}
                                            className="flex items-center gap-3 group/member cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
                                        >
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${mIdx % 2 === 0 ? 'from-blue-400 to-blue-600' : 'from-purple-400 to-pink-600'} flex items-center justify-center text-xs font-bold`}>
                                                    {member.name.charAt(0)}
                                                </div>
                                                {member.status === 'online' && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-200 truncate">{member.name}</p>
                                                <p className="text-xs text-purple-400 truncate">{member.title}</p>
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewMessages();
                                                }}
                                                className="opacity-0 group-hover/member:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full"
                                            >
                                                <MessageCircle className="w-4 h-4 text-gray-400 hover:text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Feed */}
            <main className="flex-1 max-w-3xl">
                {/* Post Creator */}
                <div className="glass-panel rounded-2xl p-4 mb-8 border border-white/10">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 overflow-hidden">
                            <img src={photoURL} alt="Me" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder={`Share a memory, ${displayName.split(' ')[0]}...`}
                                className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 text-sm py-2.5 outline-none"
                            />

                            {/* Error Banner */}
                            {postError && (
                                <div className="mt-2 text-xs text-red-300 bg-red-500/20 border border-red-500/50 p-2 rounded-lg flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                        {postError}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("This will clear all old posts and memories to fix the storage. Are you sure?")) {
                                                localStorage.removeItem('feedPosts');
                                                localStorage.removeItem('mediaVault');
                                                setPosts([]);
                                                window.location.reload();
                                            }
                                        }}
                                        className="underline hover:text-white cursor-pointer"
                                    >
                                        Fix IT (Reset Storage)
                                    </button>
                                </div>
                            )}

                            {/* Media Preview */}
                            {mediaPreview && (
                                <div className="relative mt-2 rounded-xl overflow-hidden bg-black/40 border border-white/10 inline-block max-w-full">
                                    <button
                                        onClick={handleRemoveMedia}
                                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-10"
                                    >
                                        <X size={14} />
                                    </button>
                                    {mediaType === 'image' ? (
                                        <img src={mediaPreview} alt="Preview" className="max-h-60 w-full object-contain" />
                                    ) : (
                                        <video src={mediaPreview} className="max-h-60 w-full object-contain" />
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                <div className="flex gap-4 text-gray-400">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1.5 hover:text-purple-400 transition-colors text-xs font-medium"
                                    >
                                        <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></span>
                                        Photo/Video
                                    </button>
                                    <button className="flex items-center gap-1.5 hover:text-purple-400 transition-colors text-xs font-medium">
                                        <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Sparkles className="w-4 h-4" /></span>
                                        Memory
                                    </button>
                                </div>
                                <button
                                    onClick={handlePostUpdate}
                                    className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Post Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Items */}
                <div className="space-y-6">
                    {posts.map((post) => (
                        <article key={post.id} className="glass-panel rounded-2xl overflow-hidden border border-white/10 animate-fade-in-up">
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-sm overflow-hidden">
                                        {post.authorImage ? (
                                            <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                                        ) : (
                                            post.author.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">
                                            {post.author}
                                            <span className="text-gray-400 font-normal ml-1">({post.relationship})</span>
                                        </h3>
                                        <p className="text-xs text-gray-500">{post.timestamp}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {post.author === displayName && (
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-colors"
                                            title="Delete Post"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                                            }}
                                            className={`p-2 hover:bg-white/5 rounded-full transition-colors ${activeMenuPostId === post.id ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        {activeMenuPostId === post.id && (
                                            <div className="absolute right-0 mt-2 w-56 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                                <div className="p-1">
                                                    <button onClick={(e) => handleMenuAction(e, 'share', post)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors text-left">
                                                        <Share2 className="w-4 h-4" /> Share Post
                                                    </button>
                                                    <button onClick={(e) => handleMenuAction(e, 'copylink', post)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors text-left">
                                                        <LinkIcon className="w-4 h-4" /> Copy Link
                                                    </button>
                                                    <button onClick={(e) => handleMenuAction(e, 'save', post)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors text-left">
                                                        <Bookmark className="w-4 h-4" /> Save Post
                                                    </button>
                                                    <button onClick={(e) => handleMenuAction(e, 'notify', post)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors text-left">
                                                        <Bell className="w-4 h-4" /> Turn on notifications
                                                    </button>
                                                    <div className="h-px bg-white/10 my-1"></div>
                                                    <button onClick={(e) => handleMenuAction(e, 'report', post)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left">
                                                        <Flag className="w-4 h-4" /> Report Post
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-4 pb-3">
                                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{post.content}</p>
                            </div>

                            {/* Image Attachment */}
                            {post.image && (
                                <div className="w-full bg-black/50 overflow-hidden mt-2 rounded-lg">
                                    <img src={post.image} alt="Post content" className="w-full h-auto object-contain" />
                                </div>
                            )}

                            {/* Video Attachment */}
                            {post.video && (
                                <div className="w-full bg-black/50 overflow-hidden mt-2 rounded-lg">
                                    <video src={post.video} controls className="w-full h-auto object-contain" />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="p-4 flex items-center justify-between border-t border-white/5 mt-2">
                                <div className="flex gap-6">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`flex items-center gap-2 text-sm transition-colors group ${post.isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                                    >
                                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-pink-500' : 'group-hover:fill-pink-500'}`} />
                                        <span>{post.likes}</span>
                                    </button>
                                    <button
                                        onClick={() => handleComment(post.id)}
                                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span>{post.comments}</span>
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {(post.commentsList && post.commentsList.length > 0) && (
                                <div className="px-4 py-3 bg-white/5 border-t border-white/5 space-y-3">
                                    {post.commentsList.map((comment) => (
                                        <div key={comment.id} className="flex gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                                {comment.authorImage ? (
                                                    <img src={comment.authorImage} alt={comment.author} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                                                        {comment.author.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-xs text-white">
                                                        <span className="font-bold mr-1.5">{comment.author}</span>
                                                        <span className="text-gray-300">{comment.text}</span>
                                                    </p>

                                                    {/* Comment Delete Button */}
                                                    {(comment.author === displayName || post.author === displayName) && (
                                                        <button
                                                            onClick={() => handleDeleteComment(post.id, comment.id)}
                                                            className="text-gray-500 hover:text-red-400 p-1 opacity-60 hover:opacity-100 transition-all"
                                                            title="Delete Comment"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{formatTimeAgo(comment.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </main>

            {/* Right Sidebar - Notifications/Events (Hidden on tablet, shown on large) */}
            <aside className="hidden xl:block w-72 flex-shrink-0 space-y-6">
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-yellow-400" /> Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No recent activity.</p>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex gap-3 text-sm animate-fade-in-up">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.icon === 'heart' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {activity.icon === 'heart' ? <Heart className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-gray-300">
                                            <span className="font-semibold text-white">{activity.actor}</span> {activity.text}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-purple-900/40 to-indigo-900/40">
                    <h3 className="text-sm font-bold text-white mb-2">Upcoming Birthdays</h3>
                    {nextBirthday ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🎁</div>
                            <div>
                                <p className="text-sm font-semibold text-white">{nextBirthday.name} <span className="text-gray-400 font-normal text-[10px]">({nextBirthday.relation})</span></p>
                                <p className="text-xs text-purple-300">
                                    Turning {nextBirthday.turningAge} • {nextBirthday.nextBirthday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No upcoming birthdays found.</p>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default Dashboard;
