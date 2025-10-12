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

  const toggleFullScreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!document.fullscreenElement) videoContainer.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden w-xl max-w-[75%] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto shadow-lg aspect-video">
      {/* 🎬 Video */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />

      {/* 🎛️ Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2">
        {/* Barre de progression */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full accent-blue-500 cursor-pointer h-1 sm:h-1.5 rounded-lg overflow-hidden"
        />

        {/* Boutons */}
        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <span className="text-[10px] sm:text-xs">
              {formatTime((progress / 100) * duration)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={toggleFullScreen}
            className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
