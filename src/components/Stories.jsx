// src/components/Stories.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Image, Video } from "lucide-react";

const Stories = ({ socket }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Charger toutes les stories
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

 useEffect(() => {

     loadStories(); 

  if (!socket) return;

  const handleNewStory = (story) => {
    setStories(prev => [story, ...prev]);
  };

  socket.on("newStory", handleNewStory);

  return () => {
    socket.off("newStory", handleNewStory);
  };
}, [socket]);
const uniqueStories = Object.values(
  stories.reduce((acc, story) => {
    // Garde la story la plus récente pour chaque user
    if (!acc[story.user._id] || new Date(story.createdAt) > new Date(acc[story.user._id].createdAt)) {
      acc[story.user._id] = story;
    }
    return acc;
  }, {})
);

  // ✅ Ajouter une story
  const handleAddStory = async () => {
    if (!media) return;
    setLoading(true);
    try {
      // Simule l’upload vers ton backend (tu peux remplacer par upload réel)
      const formData = new FormData();
      formData.append("file", media);

      const uploadRes = await axios.post("http://localhost:5000/api/upload/storie", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const mediaUrl = uploadRes.data.url;
      const type = media.type.startsWith("video") ? "video" : "image";

      socket.emit("addStory", { mediaUrl, type, caption: "" });

      setMedia(null);
      setPreview(null);
    } catch (err) {
      console.error("Erreur ajout story:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="flex flex-col h-full border-l bg-white dark:bg-gray-900 text-black dark:text-white">
  {/* Header */}
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
    <h2 className="text-lg font-semibold">Stories</h2>

    {/* ➕ Bouton ajouter */}
    <label className="cursor-pointer flex items-center gap-1 text-blue-500 hover:text-blue-600">
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

  {/* Preview avant ajout */}
  {preview && (
    <div className="p-4">
      {media.type.startsWith("image") ? (
        <img src={preview} alt="preview" className="rounded-lg w-full" />
      ) : (
        <video src={preview} controls className="rounded-lg w-full" />
      )}
      <button
        onClick={handleAddStory}
        disabled={loading}
        className="mt-2 w-full py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {loading ? "Ajout..." : "Publier la story"}
      </button>
    </div>
  )}

  {/* Liste des stories scrollable */}
  <div className="flex-1 overflow-y-auto p-3 space-y-4">
    {stories.length === 0 ? (
      <p className="text-gray-400 text-center mt-10">
        Aucune story disponible
      </p>
    ) : (
      uniqueStories.map((story) => (
        <div
          key={story._id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <img
            src={`http://localhost:5000${story.user.avatar}` || "/default-avatar.png"}
            alt={story.user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-medium">{story.user.username}</p>
            {story.media.type === "image" ? (
              <Image size={16} className="text-gray-400" />
            ) : (
              <Video size={16} className="text-gray-400" />
            )}
          </div>
          <img
            src={story.media.url}
            alt="story"
            className="w-12 h-12 object-cover rounded-md"
          />
        </div>
      ))
    )}
  </div>
</div>

  );
};

export default Stories;
