import React, { useState } from "react";
import { Eye, Image as ImageIcon, Video, X } from "lucide-react";

export default function UserStoriesList({ stories, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextStory = () => {
    setCurrentIndex((prev) =>
      prev + 1 < stories.length ? prev + 1 : prev
    );
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const story = stories[currentIndex];

  // 🔹 Calcul du temps écoulé
  const timeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString);
    const diffHours = diffMs / 1000 / 60 / 60;
    if (diffHours < 1) return `${Math.floor(diffHours * 60)} min`;
    if (diffHours < 24) return `${Math.floor(diffHours)} h`;
    return `${Math.floor(diffHours / 24)} j`;
  };

  if (!story)
    return (
      <p className="text-center text-gray-400 py-6">
        Aucune story disponible
      </p>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* 🧭 Navigation */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white hover:text-red-400 transition"
      >
        <X size={28} />
      </button>

      <button
        onClick={prevStory}
        className="absolute left-4 text-white/70 hover:text-white text-5xl select-none"
      >
        ‹
      </button>

      <button
        onClick={nextStory}
        className="absolute right-4 text-white/70 hover:text-white text-5xl select-none"
      >
        ›
      </button>

      {/* 🖼️ Story Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden w-[90%] max-w-md">
        {/* Media */}
        <div className="relative w-full h-[450px] sm:h-[500px]">
          {story.media.type === "image" ? (
            <img
              src={story.media.url}
              alt="Story"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={story.media.url}
              className="w-full h-full object-cover"
              controls
              autoPlay
            />
          )}

          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            {story.media.type === "image" ? (
              <ImageIcon size={14} />
            ) : (
              <Video size={14} />
            )}
            {story.media.type}
          </span>
        </div>

        {/* Infos */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {story.caption || "Aucune légende"}
            </p>
            <p className="text-xs text-gray-400">
              Publiée il y a {timeAgo(story.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <Eye size={16} />
            <span className="text-sm font-medium">
              {story.viewers?.length || 0}
            </span>
          </div>
        </div>

        {/* Pagination (points) */}
        <div className="flex justify-center pb-3">
          {stories.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 mx-1 rounded-full ${
                idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
