import { useState } from "react";
import { X, Maximize2 } from "lucide-react";

export default function CustomImageViewer({ src, alt, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 🖼️ Miniature (cliquable) */}
      <div
        onClick={() => setIsOpen(true)}
        className={`relative cursor-pointer group ${className}`}
      >
        <img
          src={src}
          alt={alt}
          className="rounded-lg object-cover w-full h-full transition-transform duration-200 group-hover:scale-105 shadow-md"
        />

        {/* 🔍 Icône zoom au survol */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition">
          <Maximize2 className="text-white" size={22} />
        </div>
      </div>

      {/* 🪟 Lightbox plein écran */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
            onClick={(e) => {
              e.stopPropagation(); // évite la fermeture au clic sur le bouton
              setIsOpen(false);
            }}
          >
            <X size={20} />
          </button>

          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </>
  );
}
