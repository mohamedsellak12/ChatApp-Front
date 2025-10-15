import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

export default function CustomVideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };

    const setVideoData = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", setVideoData);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", setVideoData);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.pause();
    else video.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const newProgress = e.target.value;
    video.currentTime = (newProgress / 100) * video.duration;
    setProgress(newProgress);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !muted;
    setMuted(!muted);
  };

   const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setProgress((video.currentTime / video.duration) * 100);
      setDuration(video.duration);
    }
  };
  const toggleFullScreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!document.fullscreenElement) videoContainer.requestFullscreen();
    else document.exitFullscreen();
  };

  function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

  return (
    <div className="relative group bg-black rounded-2xl overflow-hidden w-full max-w-3xl  mx-auto shadow-2xl">
      {/* 🎬 Video */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-80 object-contain bg-black"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* 🎛️ Controls */}
      <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3 ">
        {/* Barre de progression */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full accent-green-500 cursor-pointer h-1 rounded-full mb-2"
        />

        {/* Boutons */}
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <span className="text-xs opacity-80">
              {formatTime((progress / 100) * duration)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={toggleFullScreen}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* ▶️ Play Overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition"
        >
          <Play size={60} className="text-white drop-shadow-lg" />
        </button>
      )}
    </div>
  );
}


