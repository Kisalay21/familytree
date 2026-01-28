import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, MessageSquare, User, LogOut, Shield, Zap } from 'lucide-react';
import Logo from './Logo';

const AppNavbar = ({ userProfile }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [showAll, setShowAll] = React.useState(false);

    // Initial Load & Event Listener for Updates
    React.useEffect(() => {
        const loadNotifications = () => {
            const saved = localStorage.getItem('recentActivities');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Filter valid ones
                    const valid = parsed.filter(a => typeof a.timestamp === 'number').sort((a, b) => b.timestamp - a.timestamp);
                    setNotifications(valid);
                    // Simple logic: if new items > old known items, show dot. 
                    // For now, we'll just show dot if there are any notifications and user hasn't opened dict
                    if (valid.length > 0) setUnreadCount(Math.min(valid.length, 5));
                } catch (e) { }
            }
        };

        loadNotifications();

        // Listen for storage changes (from other tabs or component updates)
        window.addEventListener('storage', loadNotifications);
        // Custom event for same-tab updates
        window.addEventListener('activityUpdated', loadNotifications);

        return () => {
            window.removeEventListener('storage', loadNotifications);
            window.removeEventListener('activityUpdated', loadNotifications);
        };
    }, []);

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-[100] h-14 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md px-6 flex items-center justify-between">
            {/* Left: Brand */}
            <Link to="/app">
                <Logo className="scale-75" />
            </Link>

            {/* Center: Navigation (Ideally Centered absolutely) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
                <Link
                    to="/app"
                    className={`text-xs font-medium transition-colors ${isActive('/app') ? 'text-white border-b-2 border-purple-500 pb-1' : 'text-gray-400 hover:text-white'}`}
                >
                    Feed
                </Link>
                <Link
                    to="/tree"
                    className={`text-xs font-medium transition-colors ${isActive('/tree') ? 'text-white border-b-2 border-purple-500 pb-1' : 'text-gray-400 hover:text-white'}`}
                >
                    Tree View
                </Link>
                <Link
                    to="/vault"
                    className={`text-xs font-medium transition-colors ${isActive('/vault') ? 'text-white border-b-2 border-purple-500 pb-1' : 'text-gray-400 hover:text-white'}`}
                >
                    Vault
                </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <Link to="/chat" className="p-1.5 text-gray-400 hover:text-white transition-colors relative">
                    <MessageSquare size={16} />
                </Link>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            if (!isNotificationsOpen) setUnreadCount(0);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors relative"
                    >
                        <Bell size={16} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-black animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationsOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                            <div className="absolute top-full right-0 mt-2 w-80 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                                    <span
                                        className="text-xs text-purple-400 cursor-pointer hover:text-purple-300"
                                        onClick={() => {
                                            setUnreadCount(0);
                                            setNotifications([]); // Clear list as requested
                                        }}
                                    >
                                        Mark all read
                                    </span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.slice(0, showAll ? 10 : 5).map((notif, idx) => (
                                            <div key={idx} className="p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                    {(notif.user || notif.author || 'S').charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-200">
                                                        <span className="font-semibold text-white">{notif.user || notif.author || 'Someone'}</span> {notif.action}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-1">{formatTimeAgo(notif.timestamp)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-gray-500">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">No new notifications</p>
                                        </div>
                                    )}
                                </div>
                                {notifications.length > 5 && !showAll && (
                                    <div className="p-2 text-center border-t border-white/10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAll(true);
                                            }}
                                            className="text-xs text-purple-400 hover:text-white transition-colors"
                                        >
                                            View All
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Profile Menu */}
                <div className="relative ml-2">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 group focus:outline-none"
                    >
                        <div className={`w-6 h-6 rounded-full border border-white/10 overflow-hidden transition-all ${isProfileMenuOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : 'group-hover:border-purple-500'}`}>
                            <img
                                src={userProfile?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </button>

                    {isProfileMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)}></div>
                            <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                                <div className="px-4 py-3 border-b border-white/10 mb-1">
                                    <p className="text-sm font-bold text-white truncate">{userProfile?.displayName || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">user@example.com</p>
                                </div>

                                <Link
                                    to="/profile"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <User size={16} />
                                    View Profile
                                </Link>

                                <button
                                    onClick={() => {
                                        alert("Security & Privacy Settings - Coming Soon");
                                        setIsProfileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                                >
                                    <Shield size={16} />
                                    Security & Privacy
                                </button>

                                <div className="my-1 border-t border-white/10"></div>

                                <Link
                                    to="/"
                                    onClick={() => {
                                        // Clear auth logic here if needed
                                        setIsProfileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default AppNavbar;
