import { useEffect, useState } from "react";
import { FileText, Image, Video, Music, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CustomImageViewer from "./CustomImageViewer";
import CustomVideoPlayer from "./CustomVideoPlayer";
import CustomAudioPlayer from "./CustomAudio";
import CustomPDFViewer from "./CustomPDFViewer";
import Avatar from "./Avatar";

export default function ConversationDetails({ otherUser }) {
  const [conversation, setConversation] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("images"); // 🔹 tab actif
  const { user } = useAuth();

  useEffect(() => {
    if (!otherUser || !user) return;
    fetchConversation();
  }, [otherUser]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ recipientId: otherUser._id }),
      });

      const conv = await res.json();
      setConversation(conv);

      const msgRes = await fetch(`http://localhost:5000/api/messages/${conv._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const messages = await msgRes.json();

      const allAttachments = messages
        .flatMap((msg) => msg.attachments || [])
        .map((att) => ({
          ...att,
          url: `http://localhost:5000${att.url}`,
        }));

      setAttachments(allAttachments);
    } catch (err) {
      console.error("Erreur récupération conversation :", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        Chargement...
      </div>
    );

  if (!conversation)
    return (
      <div className="text-center text-gray-400 mt-10">
        Aucune conversation trouvée
      </div>
    );

  // 🔹 Séparation des fichiers par type
  const images = attachments.filter((a) => a.type === "image");
  const videos = attachments.filter((a) => a.type === "video");
  const audios = attachments.filter((a) => a.type === "audio");
  const pdfs = attachments.filter((a) => a.type === "pdf");

  const renderTabContent = () => {
    const current =
      activeTab === "images"
        ? images
        : activeTab === "videos"
        ? videos
        : activeTab === "audios"
        ? audios
        : pdfs;

    if (current.length === 0)
      return <p className="text-sm text-gray-500 mt-3">Aucun fichier trouvé</p>;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
        {current.map((att, i) => (
          <div
            key={i}
            className="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl shadow hover:shadow-md transition flex flex-col items-center justify-center"
          >
            {att.type === "image" ? (
              <CustomImageViewer
                src={att.url}
                alt={att.name}
                className="w-full h-48 rounded-xl object-cover"
              />
            ) : att.type === "video" ? (
              <CustomVideoPlayer src={att.url} className="w-full h-48" />
            ) : att.type === "audio" ? (
              <CustomAudioPlayer src={att.url} className="w-full" />
            ) : att.type === "pdf" ? (
              <CustomPDFViewer
                src={att.url}
                name={att.name}
                variant="card"
                className="w-full h-48"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-600 dark:text-gray-300 p-3">
                <FileText className="w-8 h-8" />
                <span className="text-xs mt-1 truncate w-full text-center">
                  {att.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* --- Infos de l’utilisateur --- */}
      <div className="flex items-center gap-3 border-b pb-3">
        <Avatar
          src={
            otherUser.avatar
              ? `http://localhost:5000${otherUser.avatar}`
              : "/image.png"
          }
          alt={otherUser.username}
          className="w-10 h-10"
        />
        <div>
          <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            {otherUser.username}
          </h2>
          <p className="text-sm text-gray-500">
            {otherUser.status === "online" ? "En ligne" : "Hors ligne"}
          </p>
        </div>
      </div>

      {/* --- Fichiers partagés --- */}
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Fichiers partagés
        </h3>

        {/* 🔹 Barre d’onglets */}
       {attachments.length>0 ?
        <div className="flex justify-around border-b border-gray-200 dark:border-gray-700">
          {[
            { key: "images", label: "Photos", icon: <Image size={18} /> },
            { key: "videos", label: "Vidéos", icon: <Video size={18} /> },
            { key: "audios", label: "Audios", icon: <Music size={18} /> },
            { key: "pdfs", label: "Documents", icon: <FileText size={18} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 py-2 px-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>:
        ""}

        {/* 🔹 Contenu de l’onglet actif */}
        {renderTabContent()}
      </div>
    </div>
  );
}
