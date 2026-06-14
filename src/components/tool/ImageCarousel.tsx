import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  altPrefix?: string;
}

export default function ImageCarousel({ images, altPrefix = "图片" }: ImageCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (activeIdx >= images.length) setActiveIdx(Math.max(0, images.length - 1));
  }, [images.length, activeIdx]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] sm:aspect-[16/10] rounded-xl2 border-2 border-dashed border-wood-300 bg-gradient-to-br from-wood-100/70 to-wood-50 flex items-center justify-center">
        <div className="text-center text-wood-400 px-6">
          <div className="text-6xl mb-3">🖼️</div>
          <p className="font-medium">暂无照片记录</p>
          <p className="text-xs mt-1">可编辑该工具并添加存放位置照片</p>
        </div>
      </div>
    );
  }

  const hasMultiple = images.length > 1;

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/3] sm:aspect-[16/10] rounded-xl2 overflow-hidden bg-black shadow-card group cursor-zoom-in border border-wood-200/60"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={images[activeIdx]}
          alt={`${altPrefix} ${activeIdx + 1}`}
          className="w-full h-full object-contain bg-gradient-to-br from-wood-100 to-wood-200/50 animate-fade-in"
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((i) => (i - 1 + images.length) % images.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
              aria-label="上一张"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((i) => (i + 1) % images.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
              aria-label="下一张"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-2">
          {hasMultiple && (
            <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
              {activeIdx + 1} / {images.length}
            </span>
          )}
          <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <ZoomIn size={16} strokeWidth={2.2} />
          </div>
        </div>
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                activeIdx === idx
                  ? "border-safety-orange ring-2 ring-safety-orange/30 scale-105"
                  : "border-wood-200 hover:border-wood-400 opacity-80 hover:opacity-100"
              }`}
              aria-label={`查看图片${idx + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition"
            aria-label="关闭"
          >
            <X size={24} strokeWidth={2.2} />
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition"
              >
                <ChevronLeft size={30} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx((i) => (i + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition"
              >
                <ChevronRight size={30} strokeWidth={2.5} />
              </button>
            </>
          )}

          <img
            src={images[activeIdx]}
            alt=""
            className="max-w-full max-h-full object-contain animate-bounce-soft"
            onClick={(e) => e.stopPropagation()}
          />

          {hasMultiple && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
              {activeIdx + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
