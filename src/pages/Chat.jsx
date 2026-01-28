import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, Phone, Video, Info, ArrowLeft, Image as ImageIcon, Smile, Paperclip, MessageCircle, UserPlus, Check, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // --- State Initialization ---
    const safeJSON = (str, fallback) => {
        try { return JSON.parse(str) || fallback; }
        catch (e) { return fallback; }
    };

    // 1. Load User Profile (for Connections)
    const [userProfile] = useState(() => {
        const saved = localStorage.getItem('userProfile');
        return safeJSON(saved, { immediateFamily: [] });
    });

    // 2. Load Chat Data (Messages & Conversation Status)
    const [chatData, setChatData] = useState(() => {
        const saved = localStorage.getItem('chatData');
        return safeJSON(saved, {
            conversations: {} // { userId: { messages: [], status: 'accepted'|'pending', unread: 0 } }
        });
    });

    // 3. Mock "Global" Users for Discovery
    const mockGlobalUsers = [
        { id: "Alex Stranger", name: "Alex Stranger", avatar: null, status: 'offline' },
        { id: "Sarah Worker", name: "Sarah Worker", avatar: null, status: 'online' },
        { id: "Dr. Smith", name: "Dr. Smith", avatar: null, status: 'online' },
    ];

    // --- Helpers ---
    const isConnection = (name) => {
        return userProfile.immediateFamily?.some(m => m.name === name);
    };

    const getContactList = () => {
        // Merge Family (Connections) with Active Conversations
        const contacts = [];

        // Add Family Members (Default Connections)
        userProfile.immediateFamily?.forEach(member => {
            const convo = chatData.conversations[member.name] || { messages: [], status: 'accepted', unread: 0 };
            contacts.push({
                id: member.name,
                name: member.name,
                avatar: member.img,
                status: 'online', // Mock status
                lastMessage: convo.messages[convo.messages.length - 1]?.text || "Start a conversation",
                lastMessageTime: convo.messages[convo.messages.length - 1]?.timestamp || "",
                unread: convo.unread,
                type: 'connection',
                chatStatus: convo.status
            });
        });

        // Add Non-Connections with active chats
        Object.keys(chatData.conversations).forEach(userId => {
            if (!isConnection(userId)) {
                // Check if already in list
                if (!contacts.find(c => c.id === userId)) {
                    const convo = chatData.conversations[userId];
                    const mockUser = mockGlobalUsers.find(u => u.id === userId) || { name: userId, avatar: null };
                    contacts.push({
                        id: userId,
                        name: mockUser.name,
                        avatar: mockUser.avatar,
                        status: 'offline',
                        lastMessage: convo.messages[convo.messages.length - 1]?.text || "Request Sent",
                        lastMessageTime: convo.messages[convo.messages.length - 1]?.timestamp || "",
                        unread: convo.unread,
                        type: 'stranger',
                        chatStatus: convo.status
                    });
                }
            }
        });

        return contacts;
    };

    const contacts = getContactList();

    // --- Effects ---
    useEffect(() => {
        localStorage.setItem('chatData', JSON.stringify(chatData));
    }, [chatData]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatData, selectedUser]);


    // --- Handlers ---
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;

        const newMessage = {
            id: Date.now(),
            text: messageInput,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatData(prev => {
            const prevConvo = prev.conversations[selectedUser.id] || { messages: [], status: isConnection(selectedUser.id) ? 'accepted' : 'pending', unread: 0 };

            // Determine new status: 
            // If I am sending to a pending request, it stays pending until they reply.
            // But if *I* was the one who received the request (not simulated here easily without multi-user), sending accept acts as acceptance.
            // For this single-player simulation, we just store 'pending' if it's a stranger.

            return {
                ...prev,
                conversations: {
                    ...prev.conversations,
                    [selectedUser.id]: {
                        ...prevConvo,
                        messages: [...prevConvo.messages, newMessage],
                    }
                }
            };
        });

        setMessageInput('');
    };

    const handleStartNewChat = (user) => {
        setSelectedUser({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            status: user.status,
            type: isConnection(user.name) ? 'connection' : 'stranger',
        });
        setIsNewChatOpen(false);
    };

    // Current Conversation Logic
    const currentConvo = selectedUser ? (chatData.conversations[selectedUser.id] || { messages: [], status: selectedUser.type === 'connection' ? 'accepted' : 'pending' }) : null;
    const isPending = selectedUser?.type === 'stranger' && currentConvo?.status === 'pending';


    return (
        <div className="container mx-auto px-0 lg:px-4 py-4 h-[calc(100vh-80px)] max-w-7xl">
            <div className="bg-[#1a1b1e]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col md:flex-row shadow-2xl">

                {/* Sidebar - Contacts */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Messages</h2>
                            <button
                                onClick={() => setIsNewChatOpen(true)}
                                className="p-2 hover:bg-white/5 rounded-full text-purple-400 hover:text-white transition-colors" title="New Chat"
                            >
                                <UserPlus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border-none rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedUser(contact)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedUser?.id === contact.id ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 overflow-hidden">
                                        {contact.avatar ? (
                                            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg">
                                                {contact.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {contact.chatStatus === 'pending' && <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border border-black animate-pulse" title="Pending Request"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className={`font-semibold truncate ${selectedUser?.id === contact.id ? 'text-white' : 'text-gray-200'}`}>
                                            {contact.name}
                                        </h3>
                                        <span className="text-[10px] text-gray-500">{contact.lastMessageTime}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate flex justify-between">
                                        <span>{contact.chatStatus === 'pending' ? 'Request Pending...' : contact.lastMessage}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`flex-1 flex flex-col bg-[#0f0f13]/50 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-20 border-b border-white/5 p-4 flex items-center justify-between bg-[#1a1b1e]/50 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                            {selectedUser.avatar ? (
                                                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-white">
                                                    {selectedUser.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                                            {selectedUser.name}
                                            {selectedUser.type === 'stranger' && <span className="bg-gray-700 text-xs px-2 py-0.5 rounded text-gray-300 font-normal">Not Connection</span>}
                                        </h3>
                                        <p className="text-xs text-green-400 flex items-center gap-1">
                                            {selectedUser.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 hover:bg-white/10 rounded-full text-purple-400 hover:text-purple-300 transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 hover:bg-white/10 rounded-full text-purple-400 hover:text-purple-300 transition-colors">
                                        <Video className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                        <Info className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {/* Welcome Message */}
                                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        {selectedUser.avatar ? (
                                            <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover rounded-full opacity-50" />
                                        ) : (
                                            <span className="text-3xl font-bold text-gray-500">{selectedUser.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 text-center px-4">
                                        {isPending
                                            ? `You are requesting to chat with ${selectedUser.name}. They will see your message request.`
                                            : `This is the beginning of your conversation with ${selectedUser.name}.`}
                                    </p>
                                    {!isPending && <p className="text-xs text-gray-600 mt-1">Everything you say is secured by Family United encryption.</p>}
                                </div>

                                {(currentConvo?.messages || []).map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'me'
                                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-none'
                                            : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                            <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-purple-200' : 'text-gray-500'}`}>
                                                {msg.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Request Banner if Pending */}
                            {isPending && (
                                <div className="p-4 bg-yellow-500/10 border-t border-yellow-500/20 text-yellow-200 text-sm text-center flex flex-col gap-1">
                                    <p className="font-bold">Chat Request Sent</p>
                                    <p className="opacity-80 text-xs">You can send messages, but {selectedUser.name} must reply to accept the request.</p>
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="p-4 bg-[#1a1b1e]/80 border-t border-white/5 backdrop-blur-md">
                                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder={isPending ? "Add to your request..." : "Type a message..."}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-0.5"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <MessageCircle className="w-10 h-10 opacity-50" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
                            <p className="max-w-md text-gray-400">Select a family member or find someone new to chat with.</p>
                            <button
                                onClick={() => setIsNewChatOpen(true)}
                                className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl font-medium transition-all shadow-lg flex items-center gap-2"
                            >
                                <UserPlus size={18} /> Find People
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Modal */}
            {isNewChatOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsNewChatOpen(false)}>
                    <div className="w-full max-w-md bg-[#1a1b1e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
                            <h3 className="text-xl font-bold text-white">New Chat</h3>
                            <button onClick={() => setIsNewChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><XIcon size={20} /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Suggestions</p>
                                <div className="space-y-2">
                                    {mockGlobalUsers.map(u => (
                                        <div key={u.id} onClick={() => handleStartNewChat(u)} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform">{u.name.charAt(0)}</div>
                                            <div>
                                                <p className="text-white font-medium text-lg">{u.name}</p>
                                                <p className="text-xs text-gray-500">Global User • {u.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
