import { useState } from "react";
import { X, FileText, ExternalLink, Download } from "lucide-react";

export default function CustomPDFViewer({ src, name, className = "", variant = "default" }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = src;
    link.download = name || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🎨 Style selon le variant
  if (variant === "card") {
    return (
      <>
        {/* 📁 Style carré (pour fichiers partagés) */}
        <div
          onClick={() => setIsOpen(true)}
          className={`relative group flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-400 text-white rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-105 hover:shadow-xl w-36 h-36 sm:w-44 sm:h-44 overflow-hidden ${className}`}
        >
          {/* Icône PDF */}
          <FileText size={36} className="mb-2 drop-shadow-md" />

          {/* Nom du fichier */}
          <span className="text-xs font-medium text-center px-2 truncate w-full">
            {name || "document.pdf"}
          </span>

          {/* Overlay au survol */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-white hover:text-gray-200 transition"
              title="Ouvrir"
            >
              <ExternalLink size={18} />
            </a>
            <button
              onClick={handleDownload}
              className="text-white hover:text-gray-200 transition"
              title="Télécharger"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* 🪟 Lightbox plein écran */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col">
            <div className="flex justify-between items-center p-3 bg-black/60">
              <span className="text-white text-sm truncate">{name}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="text-white hover:text-red-400 transition"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-red-400 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <iframe
              src={src}
              className="flex-1 w-full h-full rounded-b-lg"
              title={name}
            />
          </div>
        )}
      </>
    );
  }

  // 💬 Style classique (dans le chat)
  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`flex items-center sm:items-stretch gap-3 border rounded-2xl p-3 shadow-sm cursor-pointer transition w-fit max-w-full ${className} 
          bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`}
      >
        <div className="flex-shrink-0 bg-red-500 text-white p-3 sm:p-2.5 rounded-xl flex items-center justify-center">
          <FileText size={22} />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px] sm:max-w-[180px]">
            {name || "document.pdf"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 sm:block">
            PDF File
          </span>
        </div>

        <div className="flex sm:flex-col gap-2 items-center">
          <button
            onClick={handleDownload}
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition"
            title="Télécharger"
          >
            <Download size={16} />
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col">
          <div className="flex justify-between items-center p-3 bg-black/60">
            <span className="text-white text-sm truncate">{name}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="text-white hover:text-red-400 transition"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-red-400 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <iframe
            src={src}
            className="flex-1 w-full h-full rounded-b-lg"
            title={name}
          />
        </div>
      )}
    </>
  );
}
