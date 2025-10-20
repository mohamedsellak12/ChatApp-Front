import React,{ useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { IoArrowBack, IoSettingsOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Check, CircleDashed, Divide, Edit2, FileText, Image, MessageCircle, Music, PlusCircle, Search, Trash2, Users, Video } from "lucide-react";
import { Paperclip, X } from "lucide-react";
import CustomAudio from "./CustomAudio";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { motion, AnimatePresence } from "framer-motion";
import CustomImageViewer from "./CustomImageViewer";
import CustomPDFViewer from "./CustomPDFViewer";
import Avatar from "./Avatar";
import SettingsMenu from "./SettingsMenu";
import { useTheme } from "../context/ThemeContext";
import ConversationDetails from "./ConversationDetails";
import toast from "react-hot-toast";
import StoryViewer from "./StoryViewer";
import UserStoriesList from "./UserStoriesList";
// import Stories from "./Stories";

export default function ChatApp() {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const { darkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserStories , setSelectedUserStories] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [viewList, setViewList] = useState("users"); // "users" ou "conversations"
  const [isMobileView, setIsMobileView] = useState(false);
  const [query,setQuery]=useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsPreview, setAttachmentsPreview] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showAllUserStories, setShowAllUserStories] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const prevConversationRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showConversationDetails,setShowConversationDetails]=useState();
  const [preview, setPreview] = useState(null);
  const [media, setMedia] = useState(null);
  const [stories, setStories] = useState([]);
  const [UserStories, setUserStories] = useState([]);
  const [caption, setCaption] = useState("");


  const usersFiltered=users.filter(u=>u.username.toLowerCase().includes(query.toLowerCase()))

  const unreadConvs = conversations.filter(conv => !conv.isReaded);
const totalUnread = unreadConvs.length;




 // 🔹 Commencer à éditer un message
  const startEditMessage = (message) => {
    setEditingMessage(message);
    setEditContent(message.content);
  };

  // 🔹 Annuler la modification
  const cancelEdit = () => {
    setEditingMessage(null);
    setEditContent("");
  };


  


  // Détection mode mobile
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 const toggleSelectMessage = (msgId) => {
    setSelectedMessageId((prev) => (prev === msgId ? null : msgId));
  };
  const handleScroll = (e) => {
      console.log("scrollTop:", e.target.scrollTop);
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
  setShowScrollButton(!isAtBottom);
};
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

const uniqueStories = Object.values(
  stories.reduce((acc, story) => {
    // Garde la story la plus récente pour chaque user
    if (!acc[story.user._id] || new Date(story.createdAt) > new Date(acc[story.user._id].createdAt)) {
      acc[story.user._id] = story;
    }
    return acc;
  }, {})
);

const lastStory = UserStories.length > 0 
  ? UserStories[ 0] 
  : null;

 const handleSelectUser = (userId) => {
    const userStories = stories
      .filter(story => story.user._id === userId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // ordre chronologique

      loadStories()
    setSelectedUserStories(userStories);
  };

  // Charger users & conversations
  const loadUsers = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.filter(u => u._id !== user.user._id));
    } catch (err) {
      console.error(err);
    }
  };

   const loadStories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stories/all", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setStories(res.data);
      
    } catch (err) {
      console.error("Erreur load stories:", err);
    }
  };

   const loadUserStories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stories/mine", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUserStories(res.data);
      
    } catch (err) {
      console.error("Erreur load stories:", err);
    }
  };

 const loadConversations = async () => {
  if (!user?.token) return;
  try {
    const res = await fetch("http://localhost:5000/api/conversations/user", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (!res.ok) return;

    const data = await res.json();

    // 🔥 Trier par date du dernier message (ou createdAt si pas de message)
    const sorted = data.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt || a.createdAt;
      const dateB = b.lastMessage?.createdAt || b.createdAt;
      return new Date(dateB) - new Date(dateA);
    });
    setConversations(sorted.filter((c)=>c.lastMessage));
  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
    loadUsers();
    loadConversations();
    loadStories();
    loadUserStories()
    console.log("My stories :"+UserStories)
  }, [user?.token]);
  

 
  // Initialisation Socket
  useEffect(() => {
    if (!user?.token) return;

    const socket = io("http://localhost:5000", {
      auth: { token: user.token },
      autoConnect: true,
      reconnection:true

    });
    
    socketRef.current = socket;
    
    socket.on("connect", () => console.log("⚡ socket connected", socket.id));

    socket.on("userStatusChange", data => {
      setUsers(prev => prev.map(u => u._id === data.userId ? { ...u, status: data.status } : u));
      setSelectedUser(prev => prev && prev._id === data.userId ? { ...prev, status: data.status } : prev);
      setConversations((prevConversations) =>
               prevConversations.map((conv) => {
      const updatedParticipants = conv.participants.map((p) =>
        p._id === data.userId ? { ...p, status: data.status } : p
      );
      return { ...conv, participants: updatedParticipants };
    })
  );
    });

    socket.on("typing", ({ userId }) => {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, typing: true } : u));
      setSelectedUser(prev => prev && prev._id === userId ? { ...prev, typing: true } : prev);
      setConversations(prev =>
        prev.map(conv => {
         const other = conv.participants.find(p => p._id === userId);
         if (!other) return conv; // pas concerné
         const updatedParticipants = conv.participants.map(p =>
           p._id === userId ? { ...p, typing: true } : p
        );
        return { ...conv, participants: updatedParticipants };
      }) );
    });

    socket.on("stopTyping", ({ userId }) => {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, typing: false } : u));
      setSelectedUser(prev => prev && prev._id === userId ? { ...prev, typing: false } : prev);
       setConversations(prev =>
            prev.map(conv => {
            const other = conv.participants.find(p => p._id === userId);
            if (!other) return conv; // pas concerné
            const updatedParticipants = conv.participants.map(p =>
               p._id === userId ? { ...p, typing: false } : p
             );
           return { ...conv, participants: updatedParticipants };
         }) );
    });

    socket.on("newMessage", msg => {
      setMessages(prev => [...prev, msg]);
      // Mettre à jour les conversations en haut
      setConversations(prev => {
        const other = prev.filter(c => c._id !== msg.conversation);
        const updated = prev.find(c => c._id === msg.conversation);
        return updated ? [updated, ...other] : prev;
      });});

    socket.on("newStory", (story) =>{
        setStories(prev => [...prev, story ])  
        setUserStories(prev=>[...prev,story])
        loadStories()
        if(user.user.id!=story.user._id){

            toast.success(`${story.user.username} ajoute une story`)
        }
    })
 
    
    socket.on("conversationUpdated", () => {
      loadConversations();
      loadUsers();
    });
    socket.on("messagesRead", ({ conversationId, readerId, messages }) => {

             // Mettre à jour les messages actuels
             setMessages(prev =>
                    prev.map(m =>
                             m.conversation === conversationId && m.sender._id !== readerId
                           ? { ...m, seen: true }
                           : m
                     )            
  );

  // Optionnel : mettre à jour la liste des conversations pour rafraîchir les statuts
  setConversations(prev =>
    prev.map(c =>
      c._id === conversationId &&
      c.lastMessage?.sender?._id !== readerId
        ? { ...c, lastMessage: { ...c.lastMessage, seen: true } }
        : c
    )
  );
});

socket.on("storyViewedByUser", ({ storyId, viewerId }) => {
  setStories(prev =>
    prev.map(story =>
      story._id === storyId
        ? { ...story, viewers: [...(story.viewers || []), { user: viewerId, viewedAt: new Date() }] }
        : story
    )
  );
 
    if(user.user.id!=viewerId){

            toast.success(` ${viewerId} Voir une story`)
        }
});

 socket.on("messageDeleted", (messageId) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
    loadConversations()
  });
  socket.on("messageUpdated", (updatedMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
    );
    loadConversations()
  });


    return () => {
      if (currentConversationId) {
        socket.emit("stopTyping", { conversationId: currentConversationId });
        socket.emit("leaveConversation", currentConversationId);
        
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.token]);
  

  // Charger conversation sélectionnée
  useEffect(() => {
    const fetchConversation = async () => {
      if (!selectedUser) return;

      if (prevConversationRef.current && socketRef.current) {
        socketRef.current.emit("leaveConversation", prevConversationRef.current);
        socketRef.current.emit("stopTyping", { conversationId: prevConversationRef.current });
      }

      try {
        const res = await fetch("http://localhost:5000/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ recipientId: selectedUser._id }),
        });
        if (!res.ok) return;
        const conv = await res.json();
        setCurrentConversationId(conv._id);
        prevConversationRef.current = conv._id;

        socketRef.current?.emit("joinConversation", conv._id);

        const res2 = await fetch(`http://localhost:5000/api/messages/${conv._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const msgs = res2.ok ? await res2.json() : [];
        setMessages(Array.isArray(msgs) ? msgs : []);

        socketRef.current?.emit("markAsRead", conv._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversation();
  }, [selectedUser, user.token]);

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages,selectedUser]);

  useEffect(() => {
  console.log("📸 attachmentsPreview updated:", attachmentsPreview);
}, [attachmentsPreview]);

  // Typing
  const handleInputChange = e => {
    const value = e.target.value;
    setMessage(value);
    if (!currentConversationId || !socketRef.current) return;

    if (!isTypingRef.current) {
      socketRef.current.emit("typing", { conversationId: currentConversationId });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", { conversationId: currentConversationId });
      isTypingRef.current = false;
      typingTimeoutRef.current = null;
    }, 800);
  };

 const handleFileChange = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  // 1️⃣ Afficher les preview locales
  const previews = files.map((file) => ({
    name: file.name,
    url: URL.createObjectURL(file),
    type: detectFileType(file.name),
    local: true,
  }));
  setAttachmentsPreview((prev) => [...prev, ...previews]);

  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("attachments", file));

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
      body: formData,
    });

    if (!res.ok) throw new Error("Erreur serveur");
    const data = await res.json();

    // 2️⃣ Remplacer les previews locales par les vrais fichiers (sans tout supprimer)
    setAttachments((prev) => [...prev, ...data.files]);
    setAttachmentsPreview((prev) =>
      prev.map((p) =>
        files.some((f) => f.name === p.name)
          ? { ...data.files.find((f) => f.originalName === p.name) || p, local: false }
          : p
      )
    );
  } catch (err) {
    console.error("Erreur upload:", err);
  }
};



  const removeAttachment = (index) => {
    setAttachmentsPreview((prev) => prev.filter((_, i) => i !== index));
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  

   const sendMessage = () => {
    if (!selectedUser || (message.trim() === "" && attachments.length === 0))
      return;

    socketRef.current?.emit("stopTyping", { conversationId: currentConversationId });
    socketRef.current?.emit("sendMessage", {
      conversationId: currentConversationId,
      recipientId: selectedUser._id,
      content: message.trim(),
      attachments,
    });

    setMessage("");
    setAttachments([]);
    setAttachmentsPreview([] );
    loadConversations()

     // vider après envoi
  };
  const handleDeleteMessage = (msgId) => {
  socketRef.current?.emit("deleteMessage", { messageId: msgId });

};

 const handleAddStory = async () => {
  if (!media) return;

  try {
    const formData = new FormData();
    formData.append("file", media);
    formData.append("caption", caption);

    // ✅ Déterminer le type par extension
    const ext = media.name.split(".").pop().toLowerCase();
    let type = "image"; // par défaut

    if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
      type = "video";
    } else if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
      type = "image";
    }

    const uploadRes = await axios.post(
      "http://localhost:5000/api/upload/storie",
      formData,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    const mediaUrl = uploadRes.data.url;

    socketRef.current?.emit("addStory", { mediaUrl, type, caption: caption });

    setMedia(null);
    setPreview(null);
    loadStories();
    loadUserStories();
  } catch (err) {
    console.error("Erreur ajout story:", err);
  }
};


const handleUpdateMessage = () => {
    if (!editingMessage || !editContent.trim()) return;

    socketRef.current?.emit("updateMessage", {
      messageId: editingMessage._id,
      content: editContent.trim(),
    });

  

    cancelEdit();
  };

  function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatTimeLastMessage(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  // Vérifier si c'était hier
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) {
    return time;
  } else if (isYesterday) {
    return `Hier `;
  } else {
    const formattedDate = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${formattedDate} `;
  }
}
 const detectFileType = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (["mp3", "wav"].includes(ext)) return "audio";
    if (ext === "pdf") return "pdf";
    return "file";
  };


  return (
   <div  className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
    
     {/* --- 🧭 SIDEBAR --- */}
{(!isMobileView || !selectedUser) && (
  <div className="md:w-1/3 w-full h-full bg-white dark:bg-gray-800 flex flex-col border-r dark:border-gray-700 shadow-sm">
   {/* Header */}
<div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-800">
  {/* --- Logo + Nom du projet --- */}
  <h1 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100 select-none">
    {/* --- Logo icon (power + chat bubble) --- */}
    <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
      {/* Cercle externe (power button) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v9m6.364-3.364A9 9 0 116.343 6.343"
        />
      </svg>

    </span>

    {/* --- Nom stylisé --- */}
    <span className="bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 bg-clip-text text-transparent tracking-wider">
      OnTalk
    </span>
  </h1>

  {/* --- Bouton paramètres --- */}
  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
    <SettingsMenu />
  </button>
</div>


   {/* --- Onglets --- */}
<div className="flex border-b border-gray-200 dark:border-gray-700">
 <button
  className={`flex-1 p-2 text-sm font-medium flex items-center justify-center gap-2 transition 
    ${viewList === "users" 
      ? "border-b-2 border-green-500 text-green-700 dark:text-green-200" 
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}
  onClick={() => {
    loadUsers();
    setViewList("users");
  }}
>
  <Users size={24} className="w-5 h-5" />
</button>

  
<button
  className={`flex-1 flex items-center justify-center gap-2 p-2 text-sm font-medium relative transition
    ${viewList === "conversations"
      ? "border-b-2 border-green-500 text-green-700 dark:text-green-200"
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}
  onClick={() => {
    loadConversations();
    setViewList("conversations");
  }}
>
  {/* Icône avec badge */}
  <div className="relative">
    <MessageCircle
      size={24}
      className={`${
        viewList === "conversations"
          ? "text-green-600 dark:text-green-300"
          : "text-gray-500 dark:text-gray-400"
      }`}
    />

    {totalUnread > 0 && (
      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
        {totalUnread > 9 ? "9+" : totalUnread}
      </span>
    )}
  </div>

  {/* <span>Conversations</span> */}
</button>



<button
    className={`flex-1 flex items-center justify-center gap-2 p-2 text-sm font-medium transition
      ${viewList === "stories"
        ? "border-b-2 border-green-500 text-green-700 dark:text-green-200"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    onClick={() => setViewList("stories")}
  >
    <CircleDashed
      size={24}
      className={`${
        viewList === "stories"
          ? "text-green-600 dark:text-green-300"
          : "text-gray-500 dark:text-gray-400"
      }`}
    />
  </button>
</div>


    {/* --- Liste utilisateurs --- */}
    {viewList === "users" && (
      <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-800">
        <div className="p-3 relative flex-shrink-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
        </div>
        <ul className="flex-1 overflow-y-auto p-3 space-y-3">
          {usersFiltered.length > 0 ? (
            usersFiltered.map((u) => (
              <li
                key={u._id}
                onClick={() =>{
                    setShowConversationDetails(false)
                     setSelectedUser(u)}}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Avatar
                  src={u.avatar ? `http://localhost:5000${u.avatar}` : "/image.png"}
                  alt={u.username}
                  className="w-10 h-10"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-gray-800 dark:text-gray-100">{u.username}</p>
                  <p
                    className={`text-sm ${
                      u.typing
                        ? "text-green-500 animate-pulse"
                        : u.status === "online"
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-400"
                    }`}
                  >
                    {u.typing ? "typing..." : u.status}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-400 dark:text-gray-300 text-sm mt-4">
              Aucun utilisateur trouvé
            </p>
          )}
        </ul>
      </div>
    )}

    {/* --- Liste conversations --- */}
  {viewList === "conversations" && (
  <ul className="flex-1 overflow-y-auto p-4 space-y-3">
    {conversations.length > 0 ? (
      conversations.map((conv) => {
        const other = conv.participants.find((p) => p._id !== user.user.id);
        const lastMsg = conv.lastMessage;
        const isSentByCurrentUser = lastMsg?.sender?._id === user.user.id;
        const isUnread =
          lastMsg && lastMsg.sender?._id !== user.user.id && !lastMsg.seen;

        const isSelected = selectedUser?._id === other._id; 
        

        return (
          <li
            key={conv._id}
            onClick={() =>{
                 setSelectedUser(other)
                 loadConversations()
                setShowConversationDetails(false)
            }}
            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors
              ${isSelected
                ? "bg-gray-200 dark:bg-gray-700" // <-- style spécial sélection
                : isUnread
                ? "bg-green-50 hover:bg-green-100 dark:bg-green-800 dark:hover:bg-green-900"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            <div className="relative">
              <Avatar
                src={other.avatar ? `http://localhost:5000${other.avatar}` : "/image.png"}
                alt={other.username}
                className="w-10 h-10"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  other.status === "online" ? "bg-green-500" : "bg-gray-400 dark:bg-gray-500"
                }`}
              ></span>
             
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate text-gray-800 dark:text-gray-100">{other.username}</div>
              <div
                className={`text-sm flex justify-between items-center ${
                  isUnread ? "text-black dark:text-gray-200 font-semibold" : "text-gray-500 dark:text-gray-300"
                }`}
              >
                   {
                    other.typing ? <p className="text-green-500 animate-pulse">typing...</p>:
                <span className="truncate flex-1 min-w-0">
                 {lastMsg && (
                              <span className="ml-1">
                                         {isSentByCurrentUser ? (
                               // --- Si le message a été envoyé par l'utilisateur courant
                               lastMsg.seen ? (
                                   <span className="text-blue-500 text-xs mr-1 shrink-0">✓✓</span>
                                ) : other.status === "online" ? (
                                <span className="text-gray-400 text-xs mr-1 shrink-0">✓✓</span> 
                                   ) : (
                                   <span className="text-gray-400 text-xs mr-1 shrink-0">✓</span> 
                                   )
                                      ) : null}
                                       </span>
                              )}

                 
            <span className="truncate inline-block max-w-[160px] align-middle">
  {(() => {
    const hasAttachment = lastMsg?.attachments?.length > 0;
    const hasText = lastMsg?.content?.trim()?.length > 0;

    if (hasAttachment) {
      const type = lastMsg.attachments[0].type;
      let AttachmentIcon = FileText;
      let typeLabel = "Fichier";

      switch (type) {
        case "image":
          AttachmentIcon = Image;
          typeLabel = "Photo";
          break;
        case "video":
          AttachmentIcon = Video;
          typeLabel = "Vidéo";
          break;
        case "audio":
          AttachmentIcon = Music;
          typeLabel = "Audio";
          break;
        case "pdf":
          AttachmentIcon = FileText;
          typeLabel = "PDF";
          break;
        default:
          AttachmentIcon = FileText;
          typeLabel = "Fichier";
      }

      return (
        <span className="inline-flex items-center gap-1">
          <AttachmentIcon className="w-4 h-4 text-blue-500" />
          {hasText ? lastMsg.content : typeLabel}
        </span>
      );
    } else if (hasText) {
      return lastMsg.content;
    } else {
      return "Aucun message";
    }
  })()}
</span>

                </span>}
                {lastMsg && (
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-300 shrink-0 whitespace-nowrap">
                    {formatTimeLastMessage(lastMsg.createdAt)}
                  </span>
                )}
               
              </div>
            </div>
             {conv.unreadCount > 0 && !isSelected && isUnread && (
                      <span className="ml-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                   {conv.unreadCount}
                       </span>
                  )}
            {/* {isUnread && !isSelected && <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>} */}
          </li>
        );
      })
    ) : (
      <p className="text-center text-gray-400 dark:text-gray-300 text-sm mt-4">
        Aucune conversation trouvée
      </p>
    )}
  </ul>
)}

{viewList === "stories" && (
     <div className="flex flex-col h-full border-l bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
     
        <div  className="flex items-center gap-4">
              {lastStory ?
               (
      <div className="relative"  >
        {lastStory.media.type === "image" ? (
          <img
          onClick={()=>setShowAllUserStories(true)}
            src={lastStory.media.url}
            alt="Ma story"
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 cursor-pointer hover:scale-105 transition"
            title={lastStory.caption || "Ma story"}
          />
        ) : 
        (
          <video
          onClick={()=>setShowAllUserStories(true)}
            src={lastStory.media.url}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 cursor-pointer hover:scale-105 transition"
            muted
          />
        )}

         <label className="cursor-pointer absolute bottom-0 right-0 bg-green-500 rounded-full flex items-center gap-1 text-gray-100 hover:text-blue-600">
          <PlusCircle size={20} />
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              setMedia(file);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
     
        {/* <span className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border border-white"></span> */}
      </div>
    ):
    <div className="relative w-14 h-14">
    <Avatar
    src={user.user.avatar? `http://localhost:5000${user.user.avatar}` : '/image.png'}
    alt={user.user.username}
    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
    />
      <label className="cursor-pointer absolute bottom-0 right-0 bg-green-500 rounded-full flex items-center gap-1 text-gray-100 hover:text-blue-600">
          <PlusCircle size={20} />
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              setMedia(file);
              setPreview(URL.createObjectURL(file));
            }}
          />
       </label>
    </div>

    }
       
       
        </div>
      </div>

      {showAllUserStories &&<UserStoriesList stories={UserStories} onClose={()=>setShowAllUserStories(false)}/>}
    
      {/* Preview avant ajout */}
     {preview && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 w-[90%] max-w-md">
      {/* ❌ Bouton fermer */}
      <button
        onClick={() => {
          setPreview(null);
          setMedia(null);
        }}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
      >
        ✕
      </button>

      {/* 🖼️ Aperçu */}
      <div className="mt-6">
        {(() => {
          const ext = media.name.split(".").pop().toLowerCase();
          const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(ext);
          return isVideo ? (
            <video
              src={preview}
              controls
              className="rounded-lg w-full h-80 object-cover"
            />
          ) : (
            <img
              src={preview}
              alt="preview"
              className="rounded-lg w-full h-80 object-cover"
            />
          );
        })()}
      </div>
      {/* 📝 Champ légende optionnelle */}
      <textarea
        placeholder="Ajoutez une légende (optionnel)..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full resize-none mt-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 p-3 text-sm transition"
        rows={2}
      ></textarea>

      {/* 🩵 Bouton publier */}
      <button
        onClick={handleAddStory}
        className="mt-4 w-full py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
      >
        Publier la story
      </button>
    </div>
  </div>
)}

    
      {/* Liste des stories scrollable */}
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
  {stories.length === 0 ? (
    <p className="text-gray-400 text-center mt-10">
      Aucune story disponible
    </p>
  ) : 
  (
    uniqueStories.map((story) => {
      const hasViewed = story.viewers?.some(
        (v) => v.user === user.user.id 
      );

      return (
        <div
          key={story._id}
          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => handleSelectUser(story.user._id)}
        >
          {/* 🟣 Avatar avec contour dynamique */}
          <div
            className={`relative flex items-center justify-center rounded-full p-[2px] ${
              hasViewed
                ? "bg-gray-400" // vue
                : "bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500" // non vue
            }`}
          >
            <Avatar
              src={
                story.user.avatar
                  ? `http://localhost:5000${story.user.avatar}`
                  : "/image.png"
              }
              alt={story.user.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-900"
            />
            {hasViewed && (
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
            )}
          </div>

          {/* 🧾 Infos utilisateur */}
          <div className="flex-1">
            <p className="font-medium">{story.user.username}</p>
            {story.media.type === "image" ? (
              <Image size={16} className="text-gray-400" />
            ) : (
              <Video size={16} className="text-gray-400" />
            )}
          </div>

          {/* 📷 Miniature (image ou vidéo) */}
          {story.media.type === "image" ? (
            <img
              src={story.media.url}
              alt="story"
              className="w-12 h-12 object-cover rounded-md border border-gray-300"
            />
          ) : (
            <video
              src={story.media.url}
              className="w-12 h-12 object-cover rounded-md border border-gray-300"
            />
          )}
        </div>
      );
    })
  )}
</div>

       {/* affichage des stories */}
         {selectedUserStories && (
       
        <StoryViewer 
         stories={selectedUserStories} 
         onClose={()=>setSelectedUserStories(null)}
         socketRef={socketRef}
         />
      )}
    </div>
)}


  </div>
)}


{/* --- 💬 CHAT ZONE --- */}
{selectedUser ? (
  <div className={` flex-col h-full md:w-3/4 w-full bg-gray-100 dark:bg-gray-900 ${showConversationDetails ? "hidden block":"flex"}`}>

    {/* --- HEADER FIXE --- */}
    <div
    onClick={()=>setShowConversationDetails(true)}
     className="flex items-center gap-3 cursor-pointer p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-20"
    >
      {isMobileView && (
        <IoArrowBack
          className=" text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          size={24}
          onClick={() =>{ 
            setSelectedUser(null)
            setShowConversationDetails(false)
             loadConversations()}}
        />
      )}

      <img
        className="w-10 h-10 rounded-full object-cover"
        src={selectedUser.avatar ? `http://localhost:5000${selectedUser.avatar}` : "/image.png"}
        alt={selectedUser.username}
      />

      <div className="flex flex-col">
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {selectedUser.username}
        </span>
        <span
          className={
            selectedUser.status === "online"
              ? "text-green-600 dark:text-green-400 text-sm"
              : "text-gray-400 dark:text-gray-400 text-sm"
          }
        >
          {selectedUser.typing ? "typing..." : selectedUser.status}
        </span>
      </div>
    </div>

    {/* --- MESSAGES SCROLLABLE --- */}
    <div className="flex-1 overflow-y-auto px-4 py-3"  onScroll={handleScroll}>
      {Object.entries(
        messages.reduce((groups, msg) => {
          const date = new Date(msg.createdAt);
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);

          let key;
          if (date.toDateString() === today.toDateString()) key = "Aujourd’hui";
          else if (date.toDateString() === yesterday.toDateString()) key = "Hier";
          else
            key = date.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

          if (!groups[key]) groups[key] = [];
          groups[key].push(msg);
          return groups;
        }, {})
      ).map(([day, msgs]) => (
        <div key={day} className="mb-4" >
          {/* --- Séparateur de date --- */}
          <div className="mx-auto my-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs rounded-full border border-gray-300 dark:border-gray-600 w-max">
            {day}
          </div>

          {/* --- Messages du jour --- */}
        {msgs.map((msg, i) => {
          const isSender = msg.sender._id === user.user.id;
             const isSelected = selectedMessageId === msg._id;
             const isEditing = editingMessage?._id === msg._id; // ✅ message en cours d'édition

  return (
    <div key={i}
      onClick={() => isSender && setSelectedMessageId(null) }
      onDoubleClick={()=>isSender && toggleSelectMessage(msg._id)}
      className={`flex flex-col mb-2 ${isSender ? "items-end" : "items-start"}`}
    >
      <div className={`relative  px-3 py-1.5 rounded-2xl max-w-[80%] break-words shadow-sm cursor-pointer transition ${
          isSender
            ? "bg-green-500 text-white rounded-br-none"
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none"
        } ${isSelected && isSender ? "ring-2 ring-green-300" : ""}`}
      >
        {/* --- Attachments --- */}
        {msg.attachments?.length > 0 && (
          <div className=" flex flex-col ">
            {msg.attachments.map((att, index) => {
              const type = att.type;
              const url = `http://localhost:5000${att.url}`;
                const messageAttachmentStyle = "max-w-[220px] sm:max-w-[250px] rounded-lg overflow-hidden mt-2 shadow-sm border border-gray-300 dark:border-gray-700";

              if (type === "image")
                return <CustomImageViewer key={index} src={url} alt={att.name} className={messageAttachmentStyle} />;
              if (type === "video") return <CustomVideoPlayer key={index} src={url} className={messageAttachmentStyle} />;
              if (type === "audio") return <CustomAudio key={index} src={url} />;
              if (type === "pdf")
                return <CustomPDFViewer key={index} src={url} name={att.name} className="max-w-[250px] mt-2"  />;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 m-2 bg-gray-200 dark:bg-gray-700 rounded-md"
                >
                  <span>📄</span>
                  <span className="truncate max-w-[120px]">{att.name}</span>
                </div>
              );
            })}
          </div>
        )}

        
       

        {/* --- Mode édition --- */}
        {isEditing ? (
  <div className="flex items-center gap-2 mt-1">
    {/* Champ d'édition */}
    <input
      type="text"
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      className={`w-full px-3 py-1.5 text-sm rounded-xl border outline-none transition-all
        ${darkMode
          ? "bg-gray-900 border-gray-700 text-gray-100 focus:ring-2 focus:ring-green-500"
          : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-green-400"
        }`}
      placeholder="Modifier le message..."
      autoFocus
    />

    {/* Boutons d'action */}
    <div className="flex gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUpdateMessage(msg._id, editContent);
          toggleSelectMessage(msg._id)
        }}
        className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition"
        title="Enregistrer"
      >
        <Check size={16} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditingMessage(null);
          toggleSelectMessage(msg._id)
        }}
        className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
        title="Annuler"
      >
        <X size={16} />
       </button>
     </div>
   </div>
  )  : (
          msg.content && <p className="text-sm mt-2">{msg.content}</p>
        )}

        {/* --- Heure + Vu --- */}
       <div className="flex items-center justify-end mt-1 text-[11px] opacity-80 space-x-1">
  {/* 🕒 Heure */}
  <span>{formatTime(msg.createdAt)}</span>

 

  {/* ✓✓ Statut vu */}
  {isSender && (
    <span className="ml-1">
      {msg.seen  ? (
        <span className="text-blue-500">✓✓</span>
      ) :  selectedUser.status==="online" ?(
        <span className="text-gray-500 dark:text-gray-100">✓✓</span>
      ):(
        <span className="text-gray-500 dark:text-gray-100">✓</span>
    
      )}
    </span>
  )}
</div>

      </div>
       {/* --- Boutons Supprimer / Éditer --- */}
  {isSender && isSelected && !isEditing && (
    <div className="flex gap-2 mt-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          startEditMessage(msg);
        }}
        className="text-yellow-500 hover:text-yellow-400 transition"
        title="Modifier le message"
      >
        <Edit2 size={16} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteMessage(msg._id);
        }}
        className="text-red-500 hover:text-red-400 transition"
        title="Supprimer le message"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )}
    </div>
  );
})}

        </div>
      ))}

      {/* --- Bouton scroll bas --- */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 bg-white dark:bg-gray-800  p-2 rounded-full shadow-lg  transition-transform transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* --- PREVIEW des fichiers attachés --- */}
    {attachmentsPreview.length > 0 && (
      <div className="sticky bottom-16 bg-gray-50 dark:bg-gray-800 p-3 flex gap-3 overflow-x-auto z-30">
        {attachmentsPreview.map((file, i) => (
          <div key={i} className="relative bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl shadow-sm p-2 flex flex-col items-center justify-center w-32 h-32 flex-shrink-0">
            <button onClick={() => removeAttachment(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md">
              <X size={16} />
            </button>
            {file.type === "image" ? (
              <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-md" />
            ) : file.type === "video" ? (
              <video src={file.url} controls className="w-full h-full rounded-md" />
            ) : file.type === "audio" ? (
              <audio src={file.url} controls className="w-full" />
            ) : file.type === "pdf" ? (
              <div className="flex flex-col items-center justify-center w-full h-full text-gray-700 dark:text-gray-200">
                <div className="bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400 w-12 h-12 flex items-center justify-center rounded-full mb-1">
                  📕
                </div>
                <p className="text-xs text-center truncate w-[80%]">{file.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-gray-600 dark:text-gray-300">
                <div className="bg-gray-200 dark:bg-gray-700 w-12 h-12 flex items-center justify-center rounded-full mb-1">
                  📄
                </div>
                <p className="text-xs text-center truncate w-[80%]">{file.name}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* --- INPUT FIXE EN BAS --- */}
    <div className="p-3 border-t bg-white dark:bg-gray-800 flex items-center gap-2 sticky bottom-0 z-20">
      <label className="p-2 cursor-pointer rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
        <Paperclip className="text-gray-600 dark:text-gray-300" size={20} />
        <input type="file" multiple onChange={handleFileChange} className="hidden" />
      </label>
      

      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder="Écrire un message..."
        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
      />

      <button
        onClick={sendMessage}
        className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
      >
        Envoyer
      </button>
    </div>
  </div>
) : !isMobileView ? (
 <div className="flex items-center justify-center h-full w-3/4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
  <div className="flex flex-col items-center justify-center text-center select-none">
    {/* --- Halo animé --- */}
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl opacity-25 animate-pulse"></div>

      {/* --- Logo OnTalk --- */}
      <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl">
        {/* Power icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          className="w-12 h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v9m6.364-3.364A9 9 0 116.343 6.343"
          />
        </svg>
      
      </div>
    </div>

    {/* --- Nom du projet --- */}
    <h1 className="mt-5 text-4xl font-extrabold bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 bg-clip-text text-transparent tracking-wide drop-shadow-sm">
      OnTalk
    </h1>

    {/* --- Sous-texte --- */}
    <p className="mt-3 text-gray-500 dark:text-gray-300 text-sm animate-fade-in">
      Sélectionnez une conversation pour commencer à discuter 💬
    </p>

    {/* --- Ligne décorative subtile --- */}
    <div className="mt-6 w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
  </div>
</div>
) : ""}

<AnimatePresence>
  {showConversationDetails && selectedUser && (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      className="absolute inset-0 md:relative md:w-3/4 bg-white dark:bg-gray-900 z-40 border-l dark:border-gray-700 overflow-y-auto"
    >
      {/* Bouton de fermeture visible sur mobile */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setShowConversationDetails(false)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20}/>
        </button>
      </div>

      <ConversationDetails otherUser={selectedUser} />
    </motion.div>
  )}
</AnimatePresence>

    </div>

  );
}
