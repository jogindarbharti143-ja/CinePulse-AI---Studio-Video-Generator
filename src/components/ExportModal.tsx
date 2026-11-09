import React, { useState } from 'react';
import { X, Download, Film, Check, Loader2, Sparkles, FileCode } from 'lucide-react';
import { VideoClip } from '../types/video';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: VideoClip[];
  totalDuration: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clips,
  totalDuration,
}) => {
  const [format, setFormat] = useState<'mp4' | 'webm' | 'json'>('mp4');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [fps, setFps] = useState<number>(30);
  const [bitrate, setBitrate] = useState<'standard' | 'high' | 'master'>('high');
  const [includeAudio, setIncludeAudio] = useState(true);
  const [burnSubtitles, setBurnSubtitles] = useState(true);

  // Render simulation state
  const [isExporting, setIsExporting] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const totalFrames = Math.max(1, Math.round(totalDuration * fps));

  const handleStartRender = () => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(clips, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `cinepulse-project-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onClose();
      return;
    }

    setIsExporting(true);
    setIsCompleted(false);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setIsCompleted(true);
          return 100;
        }
        const next = prev + 5;
        setCurrentFrame(Math.round((next / 100) * totalFrames));
        return next;
      });
    }, 120);
  };

  const handleDownloadFile = () => {
    // If clips have direct video or image, trigger file download
    const firstClip = clips[0];
    const a = document.createElement('a');
    a.href = firstClip?.videoUrl || firstClip?.thumbnail || '';
    a.download = `cinepulse-render-${resolution}-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Export & Render Reel
              </h3>
              <p className="text-[11px] text-neutral-500">
                {clips.length} scenes · {totalDuration}s total duration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5">
          {!isExporting && !isCompleted ? (
            <>
              {/* Format Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Export Container
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mp4', label: 'MP4 (H.264)', desc: 'Universal Web & Social' },
                    { id: 'webm', label: 'WebM (VP9)', desc: 'High Compression' },
                    { id: 'json', label: 'Timeline JSON', desc: 'Project Data' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        format === fmt.id
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-neutral-900 dark:text-white font-medium'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">{fmt.label}</div>
                      <div className="text-[10px] text-neutral-500">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {format !== 'json' && (
                <>
                  {/* Resolution & FPS */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Resolution
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        {(['720p', '1080p', '4k'] as const).map((res) => (
                          <button
                            key={res}
                            onClick={() => setResolution(res)}
                            className={`py-1 text-xs font-semibold rounded-md uppercase ${
                              resolution === res
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                                : 'text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Frame Rate
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        {[24, 30, 60].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFps(f)}
                            className={`py-1 text-xs font-semibold rounded-md ${
                              fps === f
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                                : 'text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            {f}fps
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Audio & Subtitle toggles */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAudio}
                        onChange={(e) => setIncludeAudio(e.target.checked)}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Mux Background Atmospheric Audio & Voiceover Tracks</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={burnSubtitles}
                        onChange={(e) => setBurnSubtitles(e.target.checked)}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Burn-in Subtitles & Title Cards to Video Stream</span>
                    </label>
                  </div>
                </>
              )}
            </>
          ) : isExporting ? (
            /* Encoding Progress View */
            <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Rendering Video Sequence...
                </h4>
                <p className="text-xs text-neutral-500 font-mono tabular-nums mt-1">
                  Encoding frame {currentFrame} of {totalFrames} ({renderProgress}%)
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-150 ease-out"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          ) : (
            /* Render Complete View */
            <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                  Master Video Ready!
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Rendered in {resolution.toUpperCase()} at {fps}fps with full audio muxing.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleDownloadFile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {format.toUpperCase()}</span>
                </button>

                <button
                  onClick={() => setIsCompleted(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors"
                >
                  Configure New Export
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isExporting && !isCompleted && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
            >
              Cancel
            </button>

            <button
              onClick={handleStartRender}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{format === 'json' ? 'Export JSON' : 'Begin Rendering'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
