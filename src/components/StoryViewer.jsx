import { Pause, Play, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

const StoryViewer = ({ stories, onClose ,socketRef}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
const [viewedStories, setViewedStories] = useState([]);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const {user}=useAuth()

  // Gestion automatique du passage entre stories
  useEffect(() => {
    if (!stories || stories.length === 0) return;
    const currentStory = stories[currentIndex];
    clearTimeout(timerRef.current);

    if(isPaused) return

    if (currentStory.media.type.includes("image")) {
      timerRef.current = setTimeout(() => {
        nextStory();
      }, 15000); // 15 secondes
    } else if (currentStory.media.type.includes("video")) {
      const video = videoRef.current;
      if (video){
          video.onended = () => nextStory();
          video.play().catch(() => {});
      }
    }
    console.log(timerRef)

    return () => {
      clearTimeout(timerRef.current);
      if (videoRef.current) videoRef.current.onended = null;
    };
  }, [currentIndex, stories ,isPaused]);

  useEffect(() => {
  const video = videoRef.current;
  if (video) {
    if (isPaused) video.pause();
    else video.play().catch(() => {});
  }
}, [isPaused]);

useEffect(() => {
  if (!stories || stories.length === 0) return;

  const currentStory = stories[currentIndex];

  // Vérifie si l'utilisateur a déjà vu la story
  const alreadyViewed = currentStory.viewers?.some(
    (v) => v.user === user.user.id
  );
  if (!alreadyViewed) {
    socketRef.current.emit("storyViewed", { storyId: currentStory._id });
  }
}, [currentIndex]);




  const nextStory = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next < stories.length) return next;
      else {
        onClose(); // Ferme la popup quand c’est fini
        return prev;
      }
    });
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

   function formatStoryDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() ===
    date.toDateString();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  if (sameDay) {
    return `Aujourd’hui, ${hours}:${minutes}`;
  } else if (yesterday) {
    return `Hier, ${hours}:${minutes}`;
  } else {
    return `${date.getDate()} ${date.toLocaleString("fr-FR", {
      month: "long",
    })}, ${hours}:${minutes}`;
  }
}
  if (!stories || stories.length === 0) return null;
  const story = stories[currentIndex];
    const isMobile = window.innerWidth < 768;

  return (
      <div className="fixed min-h-screen inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
      {/* ⬅️ Navigation gauche (extérieur) */}
      {!isMobile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevStory();
          }}
          className="absolute left-10 text-white/70 hover:text-white text-5xl z-40"
        >
          ‹
        </button>
      )}

      {/* Conteneur principal */}
      <div
        className={`relative bg-black text-white rounded-lg overflow-hidden shadow-xl 
          ${isMobile ? "w-full h-full" : "w-[400px] h-[700px]"}`}
      >
        {/* btns toggle play/pause et fermer */}
         <div className="absolute top-4 right-4 z-50 flex items-center mt-4 gap-3">

              {/* ⏯️ Bouton Pause / Play */}
    <button
      onClick={()=>setIsPaused(prev=>!prev)} // ou la fonction pour pause/play
      className="text-white/80 hover:text-white transition"
    >
      {isPaused ? (
        <Play size={28} />
      ) : (
        <Pause size={28} />
      )}
    </button>
    {/* ❌ Bouton Fermer */}
    <button
      onClick={onClose}
      className="text-white/80 hover:text-white transition"
    >
      <X size={28} />
    </button>

  
  </div>

        {/* 🔵 Barre de progression */}
       <div className="absolute top-3 left-0 w-full flex gap-1 mb-4 px-4 z-30">
  {stories.map((story, idx) => {
    const isActive = idx === currentIndex;
    const isPassed = idx < currentIndex;

    const duration =
      story.media.type.includes("image")
        ? "15s"
        : `${videoRef.current?.duration || 15}s`; // par défaut 15s si pas encore chargé

    return (
      <div
        key={idx}
        className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full ${
            isPassed
              ? "bg-white w-full"
              : isActive
              ? "bg-white animate-fill"
              : "bg-white/30 w-0"
          }`}
          style={
            isActive
              ? {
                  animation: `fillBar ${duration} linear forwards`,
                  animationPlayState: isPaused ? "paused" : "running",
                }
              : {}
          }
        ></div>
      </div>
    );
  })}
</div>

        {/* 👤 Infos utilisateur */}
        <div className="absolute top-6 left-0 w-full flex items-center gap-3 px-4 mt-4 z-30">
          <Avatar
            src={story.user.avatar ? `http://localhost:5000${story.user.avatar}` : "image.png"}
            alt={story.user.username}
            className="w-10 h-10 rounded-full object-cover border border-white/30"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">{story.user.username}</span>
            <span className="text-xs text-white/60">{formatStoryDate(story.createdAt) || "1h ago"}</span>
          </div>
        </div>

        {/* 🟣 Contenu principal */}
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={nextStory}
         
        >
          {story.media.type.includes("image") ? (
            <img
            
              src={story.media.url}
              alt=""
              className="w-full h-70 object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              src={story.media.url}
              autoPlay

              className="w-full h-96  object-contain bg-black"
            />
          )}

          {/* 📝 Caption */}
          {story.caption && (
            <div className="absolute bottom-10 text-center w-full bg-gray text-white text-sm px-4 py-3">
              <p className="truncate">{story.caption}</p>
            </div>
          )}
        </div>
      </div>

      {/* ➡️ Navigation droite (extérieur) */}
      {!isMobile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextStory();
          }}
          className="absolute right-10 text-white/70 hover:text-white text-5xl z-40"
        >
          ›
        </button>
      )}
    </div>
  );
};

export default StoryViewer;
