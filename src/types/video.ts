export type AspectRatioType = '16:9' | '9:16' | '1:1' | '21:9';

export type CameraMotionType =
  | 'pan_left'
  | 'pan_right'
  | 'tilt_up'
  | 'tilt_down'
  | 'zoom_in'
  | 'zoom_out'
  | 'orbit'
  | 'fpv_drone'
  | 'tracking'
  | 'static';

export type VideoStyleType =
  | 'Photorealistic Cinema'
  | 'Anime Neo-Tokyo'
  | 'Cyberpunk 2099'
  | '3D Cinematic Animation'
  | '70s Retro 35mm Film'
  | 'Hyperlapse Drone'
  | 'Film Noir 1940s'
  | 'Claymation Miniature';

export type ColorFilterType =
  | 'normal'
  | 'teal_orange'
  | 'noir'
  | 'matrix'
  | 'technicolor'
  | 'kodak_warm'
  | 'cyber_violet';

export type TransitionType = 'cut' | 'crossfade' | 'dissolve' | 'glitch' | 'fade_black';

export interface OverlayText {
  enabled: boolean;
  text: string;
  position: 'top' | 'middle' | 'bottom';
  fontStyle: 'cinematic' | 'bold_sans' | 'typewriter';
  color: string;
}

export interface VideoClip {
  id: string;
  title: string;
  prompt: string;
  thumbnail: string;
  videoUrl?: string | null;
  duration: number; // in seconds
  aspectRatio: AspectRatioType;
  cameraMotion: CameraMotionType;
  style: VideoStyleType;
  resolution: string;
  seed: number;
  motionStrength: number;
  filter: ColorFilterType;
  overlayText?: OverlayText;
  transitionToNext?: TransitionType;
  voiceoverAudio?: string | null;
  voiceoverText?: string;
  engine?: 'cinepulse' | 'omni';
  notice?: string;
  createdAt: string;
}

export interface SceneItem {
  sceneNumber: number;
  title: string;
  duration: number;
  visualPrompt: string;
  cameraMotion: string;
  shotType: string;
  lighting: string;
  voiceover: string;
  soundEffectPrompt?: string;
  clip?: VideoClip;
  isGenerating?: boolean;
}

export interface StoryboardProject {
  id: string;
  title: string;
  logline: string;
  genre: string;
  scenes: SceneItem[];
  backgroundMusic: string;
  musicVolume: number;
  voiceVolume: number;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  thumbnail: string;
  cameraMotion: string;
  cameraLabel: string;
  aspectRatio: AspectRatioType;
  duration: number;
  style: VideoStyleType;
  musicTrack: string;
  tags: string[];
}
