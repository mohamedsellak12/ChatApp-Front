import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

export default function CustomAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setAudioData);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setAudioData);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const newProgress = e.target.value;
    audio.currentTime = (newProgress / 100) * audio.duration;
    setProgress(newProgress);
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm w-full max-w-md">
      {/* 🔘 Bouton + Barre de progression */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-gray-50 dark:hover:bg-gray-600 transition"
        >
          {isPlaying ? (
            <Pause className="text-blue-600 w-5 h-5" />
          ) : (
            <Play className="text-blue-600 w-5 h-5" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="flex-1 accent-blue-600 cursor-pointer"
        />
      </div>

      {/* 🕓 Temps écoulé / total */}
      <div className="text-xs text-gray-500 dark:text-gray-400 w-full flex justify-between">
        <span>{formatTime((progress / 100) * duration)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* 🎵 Élément audio caché */}
      <audio ref={audioRef} src={src} preload="metadata" hidden />
    </div>
  );
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
