import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { CanvasPlayer } from './components/CanvasPlayer';
import { StudioControls } from './components/StudioControls';
import { TimelineEditor } from './components/TimelineEditor';
import { TemplatesGallery } from './components/TemplatesGallery';
import { ExportModal } from './components/ExportModal';
import {
  VideoClip,
  TemplateItem,
  StoryboardProject,
  SceneItem,
  AspectRatioType,
  CameraMotionType,
  VideoStyleType,
  ColorFilterType,
  TransitionType,
  OverlayText,
} from './types/video';

// Initial Starter Cinematic Clips
const INITIAL_CLIPS: VideoClip[] = [
  {
    id: 'clip-1',
    title: 'Neon Odyssey 2099',
    prompt:
      'Cinematic anamorphic 35mm film still of a futuristic cyberpunk city at midnight, neon holographic billboards reflected in rain slick streets, flying hover-cars streaming teal and magenta light trails, volumetric atmospheric fog, photorealistic 8k.',
    thumbnail: '/src/assets/images/video_thumb_cyberpunk_1794255734652.jpg',
    duration: 5,
    aspectRatio: '16:9',
    cameraMotion: 'fpv_drone',
    style: 'Cyberpunk 2099',
    resolution: '1080p',
    seed: 849201,
    motionStrength: 7,
    filter: 'normal',
    transitionToNext: 'crossfade',
    overlayText: {
      enabled: true,
      text: 'NEO-KYOTO // 2099',
      position: 'bottom',
      fontStyle: 'cinematic',
      color: '#00f0ff',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'clip-2',
    title: 'Abyssal Leviathan',
    prompt:
      'Bioluminescent mythical sea creature gliding through midnight deep oceanic trenches, glowing azure and violet tendrils, ethereal underwater illumination, national geographic documentary quality, cinematic depth of field, slow fluid motion.',
    thumbnail: '/src/assets/images/video_thumb_deep_ocean_1794255735126.jpg',
    duration: 5,
    aspectRatio: '16:9',
    cameraMotion: 'orbit',
    style: 'Photorealistic Cinema',
    resolution: '1080p',
    seed: 394812,
    motionStrength: 6,
    filter: 'teal_orange',
    transitionToNext: 'dissolve',
    overlayText: {
      enabled: false,
      text: 'THE ABYSSAL DEEPS',
      position: 'bottom',
      fontStyle: 'cinematic',
      color: '#ffffff',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'clip-3',
    title: 'Mojave Sundown Chase',
    prompt:
      'Vintage 35mm film still of a classic retro muscle car racing down an open Mojave desert highway toward a majestic sunset, warm golden dust storm billows behind tires, realistic anamorphic lens flare, Kodak 500T film grain.',
    thumbnail: '/src/assets/images/video_thumb_desert_highway_1794255734904.jpg',
    duration: 5,
    aspectRatio: '16:9',
    cameraMotion: 'tracking',
    style: '70s Retro 35mm Film',
    resolution: '1080p',
    seed: 928410,
    motionStrength: 8,
    filter: 'kodak_warm',
    transitionToNext: 'cut',
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'storyboard' | 'editor' | 'templates'>('studio');
  const [activeControlTab, setActiveControlTab] = useState<'text_to_video' | 'image_to_video' | 'storyboard' | 'audio'>('text_to_video');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Clips and Sequence
  const [clips, setClips] = useState<VideoClip[]>(INITIAL_CLIPS);
  const [activeClipId, setActiveClipId] = useState<string>(INITIAL_CLIPS[0].id);

  // Video Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Storyboard and Templates
  const [storyboardProject, setStoryboardProject] = useState<StoryboardProject | null>(null);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);

  // Animation frame ref for smooth playback
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch templates from API
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) {
          setTemplates(data.templates);
        }
      })
      .catch((err) => console.warn('Could not fetch templates:', err));
  }, []);

  const activeClip = clips.find((c) => c.id === activeClipId) || clips[0] || null;
  const totalDuration = clips.reduce((acc, c) => acc + c.duration, 0);

  // Playback Loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const tick = (now: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = now;
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const clipDuration = activeClip?.duration || 5;
          const next = prev + delta * playbackSpeed;
          if (next >= clipDuration) {
            return 0; // loop clip
          }
          return next;
        });

        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, activeClip?.duration]);

  // Generate Video Handler
  const handleGenerateVideo = async (params: {
    prompt: string;
    aspectRatio: AspectRatioType;
    duration: number;
    resolution: string;
    style: VideoStyleType;
    cameraMotion: CameraMotionType;
    motionStrength: number;
    seed: number;
    startImageUrl?: string;
    engine?: 'cinepulse' | 'omni';
  }) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data && data.id) {
        const newClip: VideoClip = {
          id: data.id,
          title: data.title || (params.prompt || 'AI Video Scene').slice(0, 32),
          prompt: data.prompt,
          thumbnail: data.thumbnail,
          videoUrl: data.videoUrl,
          duration: data.duration || params.duration,
          aspectRatio: data.aspectRatio || params.aspectRatio,
          cameraMotion: data.cameraMotion || params.cameraMotion,
          style: data.style || params.style,
          resolution: data.resolution || params.resolution,
          seed: data.seed || params.seed,
          motionStrength: data.motionStrength || params.motionStrength,
          filter: 'normal',
          transitionToNext: 'crossfade',
          engine: data.engine || params.engine || 'cinepulse',
          notice: data.notice,
          createdAt: data.createdAt || new Date().toISOString(),
        };

        setClips((prev) => [newClip, ...prev]);
        setActiveClipId(newClip.id);
        setCurrentTime(0);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reorder Clips
  const handleReorderClip = (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= clips.length || toIdx >= clips.length) return;
    const updated = [...clips];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setClips(updated);
  };

  // Delete Clip
  const handleDeleteClip = (clipId: string) => {
    if (clips.length <= 1) return;
    const filtered = clips.filter((c) => c.id !== clipId);
    setClips(filtered);
    if (activeClipId === clipId) {
      setActiveClipId(filtered[0].id);
      setCurrentTime(0);
    }
  };

  // Duplicate Clip
  const handleDuplicateClip = (clipId: string) => {
    const target = clips.find((c) => c.id === clipId);
    if (!target) return;
    const duplicated: VideoClip = {
      ...target,
      id: 'clip-' + Date.now(),
      title: `${target.title} (Copy)`,
    };
    const idx = clips.findIndex((c) => c.id === clipId);
    const updated = [...clips];
    updated.splice(idx + 1, 0, duplicated);
    setClips(updated);
    setActiveClipId(duplicated.id);
  };

  // Update Duration
  const handleUpdateDuration = (clipId: string, duration: number) => {
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, duration } : c)));
  };

  // Update Filter
  const handleUpdateFilter = (filter: ColorFilterType) => {
    if (!activeClipId) return;
    setClips((prev) => prev.map((c) => (c.id === activeClipId ? { ...c, filter } : c)));
  };

  // Update Transition
  const handleUpdateTransition = (clipId: string, transition: TransitionType) => {
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, transitionToNext: transition } : c)));
  };

  // Update Overlay Text
  const handleUpdateOverlayText = (clipId: string, overlay: OverlayText) => {
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, overlayText: overlay } : c)));
  };

  // Add Blank Clip
  const handleAddBlankClip = () => {
    const newClip: VideoClip = {
      id: 'clip-' + Date.now(),
      title: 'Nordic Cascades',
      prompt: 'Epic cinematic FPV drone aerial fly-through of dramatic misty emerald Icelandic waterfalls.',
      thumbnail: '/src/assets/images/video_thumb_drone_nature_1794255735515.jpg',
      duration: 5,
      aspectRatio: '16:9',
      cameraMotion: 'fpv_drone',
      style: 'Photorealistic Cinema',
      resolution: '1080p',
      seed: 554321,
      motionStrength: 6,
      filter: 'normal',
      transitionToNext: 'crossfade',
      createdAt: new Date().toISOString(),
    };
    setClips((prev) => [...prev, newClip]);
    setActiveClipId(newClip.id);
  };

  // Select Template for Preview
  const handleSelectTemplate = (template: TemplateItem) => {
    const existing = clips.find((c) => c.title === template.title);
    if (existing) {
      setActiveClipId(existing.id);
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    const templateClip: VideoClip = {
      id: 'clip-tpl-' + Date.now(),
      title: template.title,
      prompt: template.prompt,
      thumbnail: template.thumbnail,
      duration: template.duration,
      aspectRatio: template.aspectRatio,
      cameraMotion: (template.cameraMotion as CameraMotionType) || 'pan_right',
      style: template.style,
      resolution: '1080p',
      seed: 123456,
      motionStrength: 7,
      filter: 'normal',
      transitionToNext: 'crossfade',
      createdAt: new Date().toISOString(),
    };

    setClips((prev) => [templateClip, ...prev]);
    setActiveClipId(templateClip.id);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Remix Template in Studio
  const handleRemixTemplate = (template: TemplateItem) => {
    setActiveTab('studio');
    setActiveControlTab('text_to_video');
    handleSelectTemplate(template);
  };

  // Render Scene Clip from Storyboard
  const handleRenderSceneClip = async (scene: SceneItem) => {
    await handleGenerateVideo({
      prompt: scene.visualPrompt,
      aspectRatio: '16:9',
      duration: scene.duration || 5,
      resolution: '1080p',
      style: 'Photorealistic Cinema',
      cameraMotion: 'pan_right',
      motionStrength: 7,
      seed: Math.floor(Math.random() * 999999),
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Universal Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenExport={() => setIsExportOpen(true)}
        onNewProject={() => {
          setActiveClipId(clips[0].id);
          setCurrentTime(0);
          setIsPlaying(false);
        }}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* VIEW 1: STUDIO / TIMELINE WORKSPACE */}
        {activeTab !== 'templates' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Canvas Player + Timeline Track Sequencer */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Live Canvas & Video Player */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      Live Video Viewport
                    </span>
                    <span>·</span>
                    <span className="font-mono">{activeClip?.aspectRatio || '16:9'}</span>
                    <span>·</span>
                    <span className="font-mono">{activeClip?.resolution || '1080p'}</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">
                    Active: {activeClip?.title}
                  </div>
                </div>

                {activeClip?.notice && (
                  <div className="px-3 py-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between">
                    <span>{activeClip.notice}</span>
                    <span className="text-[10px] uppercase font-mono text-blue-500">Notice</span>
                  </div>
                )}

                <CanvasPlayer
                  clip={activeClip}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  currentTime={currentTime}
                  onSeek={(t) => setCurrentTime(t)}
                  speed={playbackSpeed}
                  onSpeedChange={(s) => setPlaybackSpeed(s)}
                  onFilterChange={handleUpdateFilter}
                />
              </div>

              {/* Timeline Track Editor */}
              <TimelineEditor
                clips={clips}
                activeClipId={activeClipId}
                onSelectClip={(id) => {
                  setActiveClipId(id);
                  setCurrentTime(0);
                }}
                onReorderClip={handleReorderClip}
                onDeleteClip={handleDeleteClip}
                onDuplicateClip={handleDuplicateClip}
                onUpdateTransition={handleUpdateTransition}
                onUpdateClipDuration={handleUpdateDuration}
                onUpdateOverlayText={handleUpdateOverlayText}
                currentTime={currentTime}
                totalDuration={totalDuration}
                onSeek={(t) => setCurrentTime(t)}
                onAddBlankClip={handleAddBlankClip}
              />
            </div>

            {/* Right 5 Columns: Studio Controls (Text-to-Video, Script, Soundstage) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <StudioControls
                onGenerateVideo={handleGenerateVideo}
                isGenerating={isGenerating}
                activeClip={activeClip}
                onApplyTemplate={(p, st, m, ar) => {
                  handleGenerateVideo({
                    prompt: p,
                    style: st,
                    cameraMotion: m,
                    aspectRatio: ar,
                    duration: 5,
                    resolution: '1080p',
                    motionStrength: 6,
                    seed: 12345,
                  });
                }}
                onGenerateStoryboard={(proj) => {
                  setStoryboardProject(proj);
                  setActiveTab('storyboard');
                  setActiveControlTab('storyboard');
                }}
                storyboardProject={storyboardProject}
                onRenderSceneClip={handleRenderSceneClip}
                activeControlTab={activeControlTab}
                setActiveControlTab={setActiveControlTab}
              />
            </div>
          </div>
        ) : (
          /* VIEW 2: TEMPLATES & INSPIRATION GALLERY */
          <TemplatesGallery
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onRemixTemplate={handleRemixTemplate}
          />
        )}
      </main>

      {/* Export & Render Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        clips={clips}
        totalDuration={totalDuration}
      />
    </div>
  );
}
