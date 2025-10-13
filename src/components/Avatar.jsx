// Avatar.jsx
import { useState } from "react";

export default function Avatar({ src, alt, className }) {
  const [fullScreen, setFullScreen] = useState(false);


  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover cursor-pointer ${className}`}
          onClick={(e) => {
          e.stopPropagation(); // éviter le clic parent
          setFullScreen(true);
        }}
      />

      {fullScreen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-pointer"
    onClick={(e) => {
      e.stopPropagation(); // ⚡️ empêche la propagation vers le parent
      setFullScreen(false);
    }}
  >
    <img
      src={src}
      alt={alt}
      className="max-h-full max-w-full rounded"
      onClick={(e) => e.stopPropagation()} // empêche aussi de fermer si on clique sur l'image
    />
  </div>
)}

    </>
  );
}
