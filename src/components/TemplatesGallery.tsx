import React, { useState } from 'react';
import { Play, Sparkles, Wand2, Compass, Film, Tag } from 'lucide-react';
import { TemplateItem, AspectRatioType, CameraMotionType, VideoStyleType } from '../types/video';

interface TemplatesGalleryProps {
  templates: TemplateItem[];
  onSelectTemplate: (template: TemplateItem) => void;
  onRemixTemplate: (template: TemplateItem) => void;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({
  templates,
  onSelectTemplate,
  onRemixTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Sci-Fi / Cyberpunk', 'Fantasy / Nature', 'Action / Vintage', 'Nature / Cinematic'];

  const filtered = activeCategory === 'all'
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="flex flex-col gap-6">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Cinematic Inspiration Gallery
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Pre-rendered AI video sequences with camera kinematics, lens specs, and prompts ready to remix.
          </p>
        </div>

        {/* Category Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap capitalize ${
                activeCategory === cat
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Masterpieces' : cat.split('/')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md transition-all"
          >
            {/* Visual Header Still */}
            <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

              {/* Badges on Video Still */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">
                  {item.aspectRatio} · {item.duration}s
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-600/80 backdrop-blur-md text-white text-[11px] font-mono">
                  {item.cameraLabel}
                </span>
              </div>

              {/* Play Overlay Trigger */}
              <button
                onClick={() => onSelectTemplate(item)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-xl"
                title="Preview in Player"
              >
                <Play className="w-6 h-6 ml-1 fill-white" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-neutral-500 shrink-0">
                  {item.category}
                </span>
              </div>

              {/* Prompt Box */}
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed line-clamp-2">
                "{item.prompt}"
              </div>

              {/* Tags & Action Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  {item.tags.map((tag, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="mr-1.5">·</span>}
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectTemplate(item)}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    Load in Player
                  </button>

                  <button
                    onClick={() => onRemixTemplate(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Remix</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
