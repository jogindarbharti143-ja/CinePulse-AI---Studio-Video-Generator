import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Video,
  Image as ImageIcon,
  ScrollText,
  Volume2,
  Compass,
  Sliders,
  Play,
  RotateCcw,
  Check,
  Loader2,
  Film,
  Layers,
  ArrowRight,
  Upload,
} from 'lucide-react';
import {
  AspectRatioType,
  CameraMotionType,
  VideoStyleType,
  VideoClip,
  SceneItem,
  StoryboardProject,
} from '../types/video';
import { audioEngine } from '../utils/audioEngine';

interface StudioControlsProps {
  onGenerateVideo: (params: {
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
  }) => Promise<void>;
  isGenerating: boolean;
  activeClip: VideoClip | null;
  onApplyTemplate: (templatePrompt: string, style: VideoStyleType, motion: CameraMotionType, aspect: AspectRatioType) => void;
  onGenerateStoryboard: (project: StoryboardProject) => void;
  storyboardProject: StoryboardProject | null;
  onRenderSceneClip: (scene: SceneItem) => void;
  activeControlTab: 'text_to_video' | 'image_to_video' | 'storyboard' | 'audio';
  setActiveControlTab: (tab: 'text_to_video' | 'image_to_video' | 'storyboard' | 'audio') => void;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  onGenerateVideo,
  isGenerating,
  activeClip,
  onApplyTemplate,
  onGenerateStoryboard,
  storyboardProject,
  onRenderSceneClip,
  activeControlTab,
  setActiveControlTab,
}) => {
  // Generation parameters state
  const [prompt, setPrompt] = useState(
    'A solitary cinematic cybernetic explorer standing atop a neon-drenched Tokyo skyscraper at midnight, gazing into volumetric holographic rain.'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [videoStyle, setVideoStyle] = useState<VideoStyleType>('Photorealistic Cinema');
  const [cameraMotion, setCameraMotion] = useState<CameraMotionType>('pan_right');
  const [duration, setDuration] = useState<number>(5);
  const [resolution, setResolution] = useState<string>('1080p');
  const [motionStrength, setMotionStrength] = useState<number>(6);
  const [seed, setSeed] = useState<number>(42891);
  const [engine, setEngine] = useState<'cinepulse' | 'omni'>('cinepulse');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Image-to-Video state
  const [startImageUrl, setStartImageUrl] = useState<string | null>(null);
  const [imageMotionPrompt, setImageMotionPrompt] = useState(
    'Gently illuminate holographic kanji banners while raindrops drift past the camera lens.'
  );

  // Storyboard Script state
  const [scriptIdea, setScriptIdea] = useState(
    'A futuristic deep-sea explorer encounters an ancient dormant alien leviathan in the Mariana Trench.'
  );
  const [scriptGenre, setScriptGenre] = useState('Sci-Fi / Cyberpunk');
  const [scriptSceneCount, setScriptSceneCount] = useState(3);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Voiceover / Audio state
  const [voiceText, setVoiceText] = useState(
    'In the silent depths of the Pacific, where sunlight has never reached, something older than humanity has awakened.'
  );
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [activeMusicTrack, setActiveMusicTrack] = useState('Cyber Synthwave');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  // Enhance prompt with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: videoStyle,
          cameraMotion,
          aspectRatio,
        }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Enhance failed:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Trigger Video Generation
  const handleGenerate = async () => {
    await onGenerateVideo({
      prompt: activeControlTab === 'image_to_video' ? imageMotionPrompt : prompt,
      aspectRatio,
      duration,
      resolution,
      style: videoStyle,
      cameraMotion,
      motionStrength,
      seed,
      engine,
      startImageUrl: activeControlTab === 'image_to_video' ? (startImageUrl || undefined) : undefined,
    });
  };

  // Generate Script & Storyboard with Gemini
  const handleGenerateScript = async () => {
    if (!scriptIdea.trim()) return;
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: scriptIdea,
          genre: scriptGenre,
          sceneCount: scriptSceneCount,
        }),
      });
      const data = await res.json();
      if (data.scenes && Array.isArray(data.scenes)) {
        const project: StoryboardProject = {
          id: 'proj_' + Date.now(),
          title: data.title || 'Cinematic Sequence',
          logline: data.logline || scriptIdea,
          genre: data.genre || scriptGenre,
          scenes: data.scenes,
          backgroundMusic: 'Cinematic Orchestral',
          musicVolume: 0.4,
          voiceVolume: 0.8,
        };
        onGenerateStoryboard(project);
      }
    } catch (err) {
      console.error('Script generation failed:', err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Toggle Background Music
  const handleToggleMusic = (track: string) => {
    if (isMusicPlaying && activeMusicTrack === track) {
      audioEngine.stop();
      setIsMusicPlaying(false);
    } else {
      setActiveMusicTrack(track);
      audioEngine.playTrack(track);
      audioEngine.setVolume(musicVolume);
      setIsMusicPlaying(true);
    }
  };

  // Preview Voiceover
  const handlePreviewVoiceover = async () => {
    if (!voiceText.trim()) return;
    setIsGeneratingVoice(true);
    try {
      const res = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceText,
          voice: selectedVoice,
        }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
      } else {
        // Fallback to Web Speech API
        audioEngine.speakText(voiceText);
      }
    } catch {
      audioEngine.speakText(voiceText);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const cameraOptions: { id: CameraMotionType; label: string; desc: string }[] = [
    { id: 'pan_right', label: 'Pan Right', desc: 'Lateral pan rightwards' },
    { id: 'pan_left', label: 'Pan Left', desc: 'Lateral pan leftwards' },
    { id: 'zoom_in', label: 'Push In', desc: 'Smooth cinematic zoom in' },
    { id: 'zoom_out', label: 'Pull Out', desc: 'Epic reveal zoom out' },
    { id: 'orbit', label: '360° Orbit', desc: 'Elliptical camera orbit' },
    { id: 'fpv_drone', label: 'FPV Drone', desc: 'Dynamic aerial flight' },
    { id: 'tracking', label: 'Tracking Dolly', desc: 'High-speed chase tracking' },
    { id: 'tilt_up', label: 'Tilt Up', desc: 'Grand architecture reveal' },
  ];

  const stylePresets: VideoStyleType[] = [
    'Photorealistic Cinema',
    'Anime Neo-Tokyo',
    'Cyberpunk 2099',
    '3D Cinematic Animation',
    '70s Retro 35mm Film',
    'Hyperlapse Drone',
    'Film Noir 1940s',
    'Claymation Miniature',
  ];

  const quickInspirations = [
    { label: 'Cyberpunk Rain', text: 'Anamorphic 35mm film of a cybernetic courier sprinting through rain-drenched Tokyo alleys with neon reflections' },
    { label: 'Bioluminescent Abyss', text: 'Ethereal glowing crystalline jellyfish pulsing through deep oceanic trenches with volumetric blue light' },
    { label: 'Mojave Desert Chase', text: 'Vintage 1969 muscle car blazing down an empty desert highway at golden sunset with dust clouds' },
    { label: 'Icelandic Drone', text: 'Cinematic FPV drone sweeping over roaring emerald waterfalls and mossy black volcanic cliffs' },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 overflow-x-auto">
        <button
          onClick={() => setActiveControlTab('text_to_video')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeControlTab === 'text_to_video'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-blue-500" />
          <span>Text to Video</span>
        </button>

        <button
          onClick={() => setActiveControlTab('image_to_video')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeControlTab === 'image_to_video'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span>Image to Video</span>
        </button>

        <button
          onClick={() => setActiveControlTab('storyboard')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeControlTab === 'storyboard'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5 text-purple-500" />
          <span>AI Screenplay</span>
        </button>

        <button
          onClick={() => setActiveControlTab('audio')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeControlTab === 'audio'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-500" />
          <span>Soundstage & Voice</span>
        </button>
      </div>

      {/* Main Tab Viewport */}
      <div className="p-4 sm:p-5 flex flex-col gap-5">
        {/* TAB 1: TEXT TO VIDEO */}
        {activeControlTab === 'text_to_video' && (
          <>
            {/* Prompt Area */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Cinematic Prompt
                </label>
                <button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt || !prompt.trim()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
                >
                  {isEnhancingPrompt ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  <span>{isEnhancingPrompt ? 'Enhancing with Gemini...' : 'Enhance Prompt'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your scene in vivid visual detail (lighting, camera motion, atmosphere)..."
                  className="w-full text-sm p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* Quick Inspiration Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-neutral-400 text-[11px] shrink-0">Try:</span>
                {quickInspirations.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(item.text)}
                    className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aspect Ratio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {(['16:9', '9:16', '1:1', '21:9'] as AspectRatioType[]).map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar)}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        aspectRatio === ar
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clip Duration */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {[3, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        duration === d
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Style Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Cinematic Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stylePresets.map((st) => (
                  <button
                    key={st}
                    onClick={() => setVideoStyle(st)}
                    className={`px-3 py-2 text-xs text-left rounded-lg border transition-all ${
                      videoStyle === st
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-medium'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Motion Grid */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Camera Motion Trajectory</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cameraOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCameraMotion(opt.id)}
                    className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                      cameraMotion === opt.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-neutral-900 dark:text-white font-medium'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex flex-col gap-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Advanced Parameters (Seed, Motion Dynamics, Resolution)</span>
                </span>
                <span>{showAdvanced ? '− Hide' : '+ Show'}</span>
              </button>

              {showAdvanced && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    {/* Motion Strength Slider */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Motion Strength:</span>
                        <span className="font-mono tabular-nums">{motionStrength}/10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={motionStrength}
                        onChange={(e) => setMotionStrength(parseInt(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Seed */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Seed:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                          className="w-full text-xs font-mono px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
                        />
                        <button
                          onClick={() => setSeed(Math.floor(Math.random() * 999999))}
                          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-neutral-500"
                          title="Randomize"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Resolution */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Resolution:</span>
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="text-xs px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="720p">720p HD</option>
                        <option value="1080p">1080p Full HD</option>
                        <option value="4k">4K Ultra HD</option>
                      </select>
                    </div>
                  </div>

                  {/* Synthesis Engine Selector */}
                  <div className="flex flex-col gap-2 p-3 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Synthesis Engine
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {engine === 'cinepulse' ? 'Unlimited Free Quota' : 'Paid Tier API Key Required'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEngine('cinepulse')}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          engine === 'cinepulse'
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-neutral-900 dark:text-white font-medium shadow-xs'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        <div className="font-semibold text-xs text-neutral-900 dark:text-white">
                          CinePulse Motion Engine
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          60fps responsive camera kinetics & real-time LUT grading. Zero quota limits.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEngine('omni')}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          engine === 'omni'
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-neutral-900 dark:text-white font-medium shadow-xs'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        <div className="font-semibold text-xs text-neutral-900 dark:text-white">
                          Gemini Omni Flash 1.2
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Direct video byte synthesis. Requires billing tier in Settings &gt; Secrets.
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* TAB 2: IMAGE TO VIDEO */}
        {activeControlTab === 'image_to_video' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Starting Keyframe Image
              </label>

              {startImageUrl ? (
                <div className="relative w-full h-44 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-950 flex items-center justify-center">
                  <img src={startImageUrl} alt="Starting Frame" className="h-full object-contain" />
                  <button
                    onClick={() => setStartImageUrl(null)}
                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center hover:bg-neutral-50 dark:hover:bg-neutral-950/40 transition-colors">
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Upload initial image frame to animate
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">PNG, JPG, or WebP up to 10MB</p>
                  <label className="mt-3 cursor-pointer px-3.5 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:opacity-90">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setStartImageUrl(ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Or use current generated clip image */}
            {activeClip?.thumbnail && !startImageUrl && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Or use active clip:</span>
                <button
                  onClick={() => setStartImageUrl(activeClip.thumbnail)}
                  className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded hover:bg-blue-100"
                >
                  Use Current Video Frame
                </button>
              </div>
            )}

            {/* Motion Prompt */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Motion Dynamics & Camera Direction
              </label>
              <textarea
                rows={2}
                value={imageMotionPrompt}
                onChange={(e) => setImageMotionPrompt(e.target.value)}
                placeholder="Describe how the frame should move (e.g. hair gently floating, camera pushing forward)..."
                className="w-full text-sm p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Camera Motion */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cameraOptions.slice(0, 4).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCameraMotion(opt.id)}
                  className={`p-2 rounded-lg border text-xs text-left transition-all ${
                    cameraMotion === opt.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-medium'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI SCRIPT & STORYBOARD */}
        {activeControlTab === 'storyboard' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Screenplay Premise
              </label>
              <textarea
                rows={2}
                value={scriptIdea}
                onChange={(e) => setScriptIdea(e.target.value)}
                placeholder="Enter a story concept or commercial ad idea..."
                className="w-full text-sm p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Genre & Tone
                </label>
                <select
                  value={scriptGenre}
                  onChange={(e) => setScriptGenre(e.target.value)}
                  className="text-xs p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                >
                  <option value="Sci-Fi / Cyberpunk">Sci-Fi / Cyberpunk</option>
                  <option value="Cinematic Movie Trailer">Cinematic Movie Trailer</option>
                  <option value="Commercial Brand Story">Commercial Brand Story</option>
                  <option value="Nature Documentary">Nature Documentary</option>
                  <option value="Action Thriller">Action Thriller</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Scenes Count
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {[3, 4, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => setScriptSceneCount(count)}
                      className={`py-1 text-xs font-semibold rounded-md transition-colors ${
                        scriptSceneCount === count
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {count} Scenes
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={isGeneratingScript || !scriptIdea.trim()}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isGeneratingScript ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Writing Screenplay & Shot Breakdown with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Full Screenplay & Storyboard</span>
                </>
              )}
            </button>

            {/* Rendered Storyboard scenes overview */}
            {storyboardProject && (
              <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    {storyboardProject.title} ({storyboardProject.scenes.length} Scenes)
                  </h4>
                  <span className="text-[11px] text-neutral-500">{storyboardProject.genre}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {storyboardProject.scenes.map((scene) => (
                    <div
                      key={scene.sceneNumber}
                      className="p-3 bg-neutral-50 dark:bg-neutral-950/70 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex flex-col gap-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            Scene {scene.sceneNumber}
                          </span>
                          <span className="text-neutral-400">·</span>
                          <span className="font-semibold text-neutral-900 dark:text-white">{scene.title}</span>
                          <span className="text-neutral-400">·</span>
                          <span className="text-neutral-500 font-mono">{scene.duration}s</span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300 line-clamp-1">{scene.visualPrompt}</p>
                        <p className="text-[11px] text-neutral-500 italic">"{scene.voiceover}"</p>
                      </div>

                      <button
                        onClick={() => onRenderSceneClip(scene)}
                        disabled={scene.isGenerating}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md hover:opacity-90 shrink-0 self-start sm:self-center"
                      >
                        {scene.isGenerating ? 'Rendering...' : 'Render Scene'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SOUNDSTAGE & VOICEOVER */}
        {activeControlTab === 'audio' && (
          <div className="flex flex-col gap-4">
            {/* Background Music Presets */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Atmospheric Background Score
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: 'Cyber Synthwave', desc: 'Analog bass drone & arpeggiated neon pulses' },
                  { name: 'Deep Space Ambient', desc: 'Sub-bass chord & ethereal celestial resonance' },
                  { name: 'Cinematic Orchestral', desc: 'Warm bowed strings in dramatic D minor' },
                  { name: 'Lo-Fi Chill Beat', desc: 'Nostalgic Rhodes electric piano chords' },
                ].map((track) => (
                  <button
                    key={track.name}
                    onClick={() => handleToggleMusic(track.name)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isMusicPlaying && activeMusicTrack === track.name
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{track.name}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{track.desc}</div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isMusicPlaying && activeMusicTrack === track.name
                          ? 'bg-amber-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-neutral-500 shrink-0">Music Volume:</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setMusicVolume(vol);
                    audioEngine.setVolume(vol);
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono tabular-nums text-neutral-500 w-8">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            </div>

            {/* AI Voiceover Generator */}
            <div className="flex flex-col gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  AI Narrator Voiceover (TTS)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-500">Voice:</span>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="Puck">Puck (Deep Cinematic)</option>
                    <option value="Charon">Charon (Authoritative)</option>
                    <option value="Kore">Kore (Warm Natural)</option>
                    <option value="Fenrir">Fenrir (Dramatic)</option>
                    <option value="Zephyr">Zephyr (Bright)</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={2}
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder="Enter voiceover text to narrate..."
                className="w-full text-sm p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />

              <button
                onClick={handlePreviewVoiceover}
                disabled={isGeneratingVoice || !voiceText.trim()}
                className="self-start inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGeneratingVoice ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>Listen to Voiceover</span>
              </button>
            </div>
          </div>
        )}

        {/* PRIMARY GENERATE VIDEO ACTION */}
        {activeControlTab !== 'storyboard' && activeControlTab !== 'audio' && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Cinematic AI Video Sequence...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>
                    Generate Video ({duration}s · {aspectRatio} · {resolution})
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
