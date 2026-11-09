import React from 'react';
import {
  Scissors,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sliders,
  Type,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { VideoClip, TransitionType, OverlayText } from '../types/video';

interface TimelineEditorProps {
  clips: VideoClip[];
  activeClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onReorderClip: (fromIdx: number, toIdx: number) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onUpdateTransition: (clipId: string, transition: TransitionType) => void;
  onUpdateClipDuration: (clipId: string, duration: number) => void;
  onUpdateOverlayText: (clipId: string, overlay: OverlayText) => void;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  onAddBlankClip: () => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  clips,
  activeClipId,
  onSelectClip,
  onReorderClip,
  onDeleteClip,
  onDuplicateClip,
  onUpdateTransition,
  onUpdateClipDuration,
  onUpdateOverlayText,
  currentTime,
  totalDuration,
  onSeek,
  onAddBlankClip,
}) => {
  const activeClip = clips.find((c) => c.id === activeClipId) || clips[0] || null;

  const transitionOptions: { id: TransitionType; label: string }[] = [
    { id: 'cut', label: 'Hard Cut' },
    { id: 'crossfade', label: 'Crossfade' },
    { id: 'dissolve', label: 'Film Dissolve' },
    { id: 'glitch', label: 'Cyber Glitch' },
    { id: 'fade_black', label: 'Fade to Black' },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden select-none">
      {/* Timeline Header & Transport Status */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Sequencer & Tracks
          </span>
          <span className="text-neutral-400">·</span>
          <span className="text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
            {clips.length} {clips.length === 1 ? 'clip' : 'clips'} ({totalDuration}s total)
          </span>
        </div>

        {/* Selected Clip Quick Actions */}
        {activeClip && (
          <div className="flex items-center gap-1.5 text-xs">
            {/* Quick Trim */}
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded">
              <span className="text-neutral-400 text-[11px]">Trim:</span>
              {[3, 5, 8, 10].map((d) => (
                <button
                  key={d}
                  onClick={() => onUpdateClipDuration(activeClip.id, d)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    activeClip.duration === d
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>

            {/* Duplicate */}
            <button
              onClick={() => onDuplicateClip(activeClip.id)}
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Duplicate Clip"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            {clips.length > 1 && (
              <button
                onClick={() => onDeleteClip(activeClip.id)}
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 transition-colors"
                title="Delete Clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scrubber Ruler */}
      <div className="relative w-full h-7 bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 overflow-hidden">
        {/* Seconds Tick Marks */}
        <div className="flex items-center justify-between w-full text-[10px] font-mono text-neutral-400 tabular-nums">
          {Array.from({ length: Math.ceil(totalDuration / 2) + 1 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <span>{i * 2}s</span>
              <div className="w-px h-1.5 bg-neutral-300 dark:bg-neutral-700 mt-0.5" />
            </div>
          ))}
        </div>

        {/* Playhead Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none transition-all"
          style={{
            left: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
          }}
        >
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full -ml-1 -top-1 absolute shadow-xs" />
        </div>
      </div>

      {/* TRACK 1: Video Clips Track */}
      <div className="p-4 overflow-x-auto flex items-center gap-2 min-h-[140px] bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="text-[10px] uppercase font-bold text-neutral-400 rotate-180 writing-mode-vertical shrink-0 mr-1">
          Video
        </div>

        {clips.map((clip, index) => {
          const isSelected = clip.id === activeClipId;
          return (
            <React.Fragment key={clip.id}>
              {/* Clip Card */}
              <div
                onClick={() => onSelectClip(clip.id)}
                className={`group relative flex-shrink-0 w-48 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                } bg-neutral-900`}
              >
                {/* Thumbnail Preview */}
                <div className="relative h-24 w-full bg-neutral-950 overflow-hidden">
                  <img
                    src={clip.thumbnail}
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Duration Tag */}
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono tabular-nums text-white">
                    {clip.duration}s
                  </div>

                  {/* Scene Number */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white">
                    #{index + 1}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-2 bg-white dark:bg-neutral-900 text-left">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {clip.title}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize mt-0.5 flex items-center gap-1">
                    <span>{clip.cameraMotion.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="truncate">{clip.style.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Move Left / Right Buttons */}
                <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/70 rounded p-0.5">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderClip(index, index - 1);
                      }}
                      className="p-0.5 hover:text-white text-neutral-300"
                      title="Move Left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {index < clips.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderClip(index, index + 1);
                      }}
                      className="p-0.5 hover:text-white text-neutral-300"
                      title="Move Right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Transition Selector between clips */}
              {index < clips.length - 1 && (
                <div className="flex flex-col items-center justify-center shrink-0 px-1">
                  <select
                    value={clip.transitionToNext || 'crossfade'}
                    onChange={(e) => onUpdateTransition(clip.id, e.target.value as TransitionType)}
                    className="text-[10px] font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded px-1.5 py-0.5 cursor-pointer hover:border-neutral-400"
                  >
                    {transitionOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Add Blank / New Clip Button */}
        <button
          onClick={onAddBlankClip}
          className="flex-shrink-0 w-28 h-32 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 flex flex-col items-center justify-center gap-1.5 text-neutral-500 hover:text-blue-500 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Add Scene</span>
        </button>
      </div>

      {/* TRACK 2: Audio & Voiceover Waveform Track */}
      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/40 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 w-16">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Audio</span>
        </div>

        {/* Simulated Waveform Visualizer Bar */}
        <div className="flex-1 h-6 bg-neutral-200/80 dark:bg-neutral-800/80 rounded flex items-center px-2 gap-0.5 overflow-hidden">
          {Array.from({ length: 64 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.4) * 15 + Math.cos(i * 0.7) * 12;
            return (
              <div
                key={i}
                className="w-1 rounded-xs bg-amber-500/70 dark:bg-amber-400/70"
                style={{ height: `${Math.max(15, Math.min(95, h))}%` }}
              />
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 shrink-0">
          Master Score: 44.1kHz Stereo
        </div>
      </div>

      {/* TRACK 3: Overlay Subtitle / Title Card Track */}
      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-neutral-500" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Active Clip Subtitle / Title Card:
          </span>
          <input
            type="text"
            placeholder="Add on-screen subtitle or title card text..."
            value={activeClip?.overlayText?.text || ''}
            onChange={(e) => {
              if (activeClip) {
                onUpdateOverlayText(activeClip.id, {
                  enabled: !!e.target.value,
                  text: e.target.value,
                  position: activeClip.overlayText?.position || 'bottom',
                  fontStyle: activeClip.overlayText?.fontStyle || 'cinematic',
                  color: activeClip.overlayText?.color || '#ffffff',
                });
              }
            }}
            className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 w-72 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {activeClip?.overlayText?.enabled && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-neutral-400">Position:</span>
            {(['top', 'middle', 'bottom'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => {
                  if (activeClip) {
                    onUpdateOverlayText(activeClip.id, {
                      ...activeClip.overlayText!,
                      position: pos,
                    });
                  }
                }}
                className={`px-1.5 py-0.5 rounded capitalize ${
                  activeClip.overlayText?.position === pos
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
