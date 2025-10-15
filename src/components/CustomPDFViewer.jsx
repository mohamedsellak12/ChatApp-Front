import { useState } from "react";
import { X, FileText, ExternalLink, Download } from "lucide-react";

export default function CustomPDFViewer({ src, name }) {
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

  return (
     <>
      {/* 💬 Carte PDF style WhatsApp (responsive) */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center sm:items-stretch gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition max-w-full sm:max-w-[320px] w-fit"
      >
        {/* Icône PDF */}
        <div className="flex-shrink-0 bg-red-500 text-white p-3 sm:p-2.5 rounded-xl flex items-center justify-center">
          <FileText size={22} />
        </div>

        {/* Infos du fichier */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px] sm:max-w-[180px]">
            {name || "document.pdf"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400  sm:block">
            PDF File
          </span>
        </div>

        {/* Actions */}
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

      {/* 🪟 Vue plein écran (Lightbox PDF) */}
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
