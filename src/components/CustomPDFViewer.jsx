import { useState } from "react";
import { X, FileText, ExternalLink } from "lucide-react";

export default function CustomPDFViewer({ src, name }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bloc PDF dans le message */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between gap-2 w-full bg-red-50 border border-red-200 rounded-lg p-2 cursor-pointer hover:bg-red-100 transition"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-red-500 text-white p-2 rounded-md">
            <FileText size={18} />
          </div>
          <span className="truncate text-sm text-gray-700 max-w-[130px] sm:max-w-[200px]">
            {name || "document.pdf"}
          </span>
        </div>

        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-red-600 hover:text-red-700"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Vue plein écran (Lightbox PDF) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col">
          <div className="flex justify-between items-center p-3 bg-black/60">
            <span className="text-white text-sm truncate">{name}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-red-400 transition"
            >
              <X size={20} />
            </button>
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
