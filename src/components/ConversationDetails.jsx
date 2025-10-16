import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CustomImageViewer from "./CustomImageViewer";
import CustomVideoPlayer from "./CustomVideoPlayer";
import CustomAudioPlayer from "./CustomAudio";
import CustomPDFViewer from "./CustomPDFViewer";
// import CustomImageViewer from "./CustomImageViewer";
// import CustomVideoPlayer from "./CustomVideoPlayer";
// import CustomAudioPlayer from "./CustomAudioPlayer";
// import CustomPDFViewer from "./CustomPDFViewer";

export default function ConversationDetails({ otherUser }) {
  const [conversation, setConversation] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
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

      // Extraire les pièces jointes
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

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* --- Informations de l’autre utilisateur --- */}
      <div className="flex items-center gap-3 border-b pb-3">
        <img
          src={
            otherUser.avatar
              ? `http://localhost:5000${otherUser.avatar}`
              : "/image.png"
          }
          alt={otherUser.username}
          className="w-12 h-12 rounded-full border"
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

        {attachments.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun fichier partagé</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {attachments.map((att, i) => {
              const type = att.type;

              return (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl shadow hover:shadow-md transition flex flex-col items-center justify-center"
                >
                  {type === "image" ? (
                   <CustomImageViewer
                           src={att.url}
                               alt={att.name}
                            className="w-full h-80"
                         />
                  ) : type === "video" ? (
                    <CustomVideoPlayer src={att.url}  />
                  ) : type === "audio" ? (
                    <CustomAudioPlayer src={att.url}    />
                  ) : type === "pdf" ? (
                    <CustomPDFViewer src={att.url} name={att.name} variant="card" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-600 dark:text-gray-300 p-3">
                      <FileText className="w-8 h-8" />
                      <span className="text-xs mt-1 truncate w-full text-center">
                        {att.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
