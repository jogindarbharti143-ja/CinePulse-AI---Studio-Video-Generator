import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Camera,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react';
import { VideoClip, ColorFilterType, AspectRatioType } from '../types/video';

interface CanvasPlayerProps {
  clip: VideoClip | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onFilterChange: (filter: ColorFilterType) => void;
  onSnapshot?: (dataUrl: string) => void;
}

export const CanvasPlayer: React.FC<CanvasPlayerProps> = ({
  clip,
  isPlaying,
  onTogglePlay,
  currentTime,
  onSeek,
  speed,
  onSpeedChange,
  onFilterChange,
  onSnapshot,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Load image when clip thumbnail changes
  useEffect(() => {
    if (clip?.thumbnail) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = clip.thumbnail;
      img.onload = () => {
        imageObjRef.current = img;
        renderFrame(currentTime);
      };
    }
  }, [clip?.thumbnail]);

  // Color Filter CSS / Canvas styling maps
  const getFilterStyle = (filterType: ColorFilterType = 'normal'): string => {
    switch (filterType) {
      case 'teal_orange':
        return 'contrast(1.15) saturate(1.25) hue-rotate(-10deg) brightness(0.98)';
      case 'noir':
        return 'grayscale(1) contrast(1.4) brightness(0.95)';
      case 'matrix':
        return 'hue-rotate(55deg) saturate(1.4) contrast(1.2)';
      case 'technicolor':
        return 'saturate(1.6) contrast(1.2) brightness(1.05)';
      case 'kodak_warm':
        return 'sepia(0.2) saturate(1.2) contrast(1.08) brightness(1.02)';
      case 'cyber_violet':
        return 'hue-rotate(270deg) saturate(1.3) contrast(1.15)';
      default:
        return 'none';
    }
  };

  // Render canvas frame with cinematic camera movement simulation
  const renderFrame = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const duration = clip?.duration || 5;
    const progress = Math.min(Math.max(time / duration, 0), 1);

    ctx.clearRect(0, 0, width, height);

    // If an actual video URL is loaded and ready, draw video frame
    if (clip?.videoUrl && videoRef.current && videoRef.current.readyState >= 2) {
      ctx.filter = getFilterStyle(clip.filter);
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.filter = 'none';
    } else if (imageObjRef.current && imageObjRef.current.complete) {
      // Procedural camera motion on high-res still image
      const img = imageObjRef.current;
      const motion = clip?.cameraMotion || 'pan_right';
      const strength = (clip?.motionStrength || 6) / 10;

      ctx.save();
      ctx.filter = getFilterStyle(clip?.filter || 'normal');

      // Base aspect cover sizing
      const scaleBase = Math.max(width / img.width, height / img.height) * 1.25;
      let scale = scaleBase;
      let offsetX = 0;
      let offsetY = 0;
      let rotation = 0;

      if (motion === 'pan_left') {
        offsetX = (progress - 0.5) * 80 * strength;
      } else if (motion === 'pan_right') {
        offsetX = (0.5 - progress) * 80 * strength;
      } else if (motion === 'tilt_up') {
        offsetY = (progress - 0.5) * 60 * strength;
      } else if (motion === 'tilt_down') {
        offsetY = (0.5 - progress) * 60 * strength;
      } else if (motion === 'zoom_in') {
        scale = scaleBase * (1.0 + progress * 0.18 * strength);
      } else if (motion === 'zoom_out') {
        scale = scaleBase * (1.18 - progress * 0.18 * strength);
      } else if (motion === 'orbit') {
        rotation = Math.sin(progress * Math.PI) * 0.04 * strength;
        offsetX = Math.cos(progress * Math.PI) * 40 * strength;
      } else if (motion === 'fpv_drone') {
        scale = scaleBase * (1.0 + progress * 0.22 * strength);
        offsetX = Math.sin(progress * Math.PI * 2) * 20 * strength;
        offsetY = (0.5 - progress) * 30 * strength;
      } else if (motion === 'tracking') {
        offsetX = (0.5 - progress) * 90 * strength;
        scale = scaleBase * (1.0 + Math.sin(progress * Math.PI) * 0.05 * strength);
      }

      ctx.translate(width / 2, height / 2);
      ctx.rotate(rotation);
      ctx.translate(offsetX, offsetY);

      const renderW = img.width * scale;
      const renderH = img.height * scale;
      ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

      ctx.restore();

      // Cinematic Vignette overlay
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.35,
        width / 2,
        height / 2,
        width * 0.75
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle dynamic film grain
      const grainOpacity = 0.035;
      ctx.fillStyle = `rgba(255, 255, 255, ${grainOpacity})`;
      for (let i = 0; i < 400; i++) {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        ctx.fillRect(gx, gy, 1.5, 1.5);
      }
    } else {
      // Blank dark canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
    }

    // Render Subtitle or Overlay text if configured
    if (clip?.overlayText?.enabled && clip.overlayText.text) {
      const { text, position, fontStyle, color } = clip.overlayText;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (fontStyle === 'cinematic') {
        ctx.font = '600 24px "Plus Jakarta Sans", serif';
      } else if (fontStyle === 'typewriter') {
        ctx.font = '500 20px "JetBrains Mono", monospace';
      } else {
        ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
      }

      let textY = height - 44;
      if (position === 'top') textY = 48;
      if (position === 'middle') textY = height / 2;

      // Text drop shadow for high contrast legibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = color || '#ffffff';
      ctx.fillText(text, width / 2, textY);
      ctx.restore();
    }
  };

  // Re-render when time or clip changes
  useEffect(() => {
    renderFrame(currentTime);
  }, [currentTime, clip]);

  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    if (onSnapshot) {
      onSnapshot(dataUrl);
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `cinepulse-frame-${Math.floor(currentTime * 100)}.png`;
      a.click();
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  const getAspectRatioClasses = (aspect: AspectRatioType = '16:9') => {
    switch (aspect) {
      case '9:16':
        return 'max-w-[340px] aspect-[9/16]';
      case '1:1':
        return 'max-w-[480px] aspect-square';
      case '21:9':
        return 'w-full aspect-[21/9]';
      case '16:9':
      default:
        return 'w-full aspect-[16/9]';
    }
  };

  const filterOptions: { id: ColorFilterType; label: string }[] = [
    { id: 'normal', label: 'Raw Cine Neutral' },
    { id: 'teal_orange', label: 'Teal & Orange Hollywood' },
    { id: 'noir', label: '1940s Noir Contrast' },
    { id: 'matrix', label: 'Emerald Phosphor' },
    { id: 'technicolor', label: 'Technicolor 3-Strip' },
    { id: 'kodak_warm', label: 'Kodak 500T Gold' },
    { id: 'cyber_violet', label: 'Cyber Neon Violet' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setShowFilterMenu(false);
      }}
      className="relative flex flex-col items-center justify-center w-full bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl select-none group"
    >
      {/* Aspect Ratio Viewport Container */}
      <div className={`relative mx-auto flex items-center justify-center transition-all ${getAspectRatioClasses(clip?.aspectRatio)}`}>
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain cursor-pointer"
          onClick={onTogglePlay}
        />

        {/* Hidden video element for source video decoding if url is provided */}
        {clip?.videoUrl && (
          <video
            ref={videoRef}
            src={clip.videoUrl}
            className="hidden"
            playsInline
            muted={isMuted}
          />
        )}

        {/* Center Play Overlay Trigger when paused */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            aria-label="Play video"
            className="absolute z-10 w-16 h-16 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Play className="w-7 h-7 ml-1 fill-white" />
          </button>
        )}

        {/* Camera Motion Indicator Badge */}
        {clip?.cameraMotion && (
          <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{clip.cameraMotion.replace('_', ' ')}</span>
            <span className="text-neutral-400">·</span>
            <span>{clip.style.split(' ')[0]}</span>
          </div>
        )}

        {/* Quick Filter Menu Trigger */}
        <div className="absolute top-4 right-4 z-20">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs flex items-center gap-1.5 hover:bg-black/80 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="capitalize">{clip?.filter?.replace('_', ' ') || 'LUT'}</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-lg p-1 shadow-2xl z-30">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Color Grading LUT
                </div>
                {filterOptions.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onFilterChange(f.id);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors ${
                      clip?.filter === f.id
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Control Bar */}
      <div
        className={`w-full bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent px-4 py-3 transition-opacity duration-200 z-10 ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Scrubber Bar */}
        <div className="relative w-full group/scrub mb-2.5">
          <input
            type="range"
            min={0}
            max={clip?.duration || 5}
            step={0.01}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none hover:h-2 transition-all"
          />
        </div>

        {/* Lower Transport Strip */}
        <div className="flex items-center justify-between text-neutral-300 text-xs font-mono">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={onTogglePlay}
              className="p-1.5 text-white hover:text-blue-400 rounded transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Replay */}
            <button
              onClick={() => onSeek(0)}
              className="p-1.5 hover:text-white rounded transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Timecode in tabular-nums */}
            <div className="tabular-nums text-neutral-300 text-[11px] font-mono tracking-tight">
              <span>{formatTimecode(currentTime)}</span>
              <span className="text-neutral-600 mx-1">/</span>
              <span className="text-neutral-400">{formatTimecode(clip?.duration || 5)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    speed === s ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 hover:text-white rounded transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Snapshot */}
            <button
              onClick={handleCaptureSnapshot}
              className="p-1.5 hover:text-white rounded transition-colors"
              title="Capture 4K Frame Still"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 hover:text-white rounded transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
