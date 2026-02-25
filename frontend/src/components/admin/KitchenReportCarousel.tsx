import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const KitchenReportCarousel: React.FC<{
  slides: { id: string; title: string; content: React.ReactNode }[];
}> = ({ slides }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = slides.length;
  const safeIndex = useMemo(
    () => Math.min(Math.max(activeIndex, 0), Math.max(0, total - 1)),
    [activeIndex, total]
  );

  if (total === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-black uppercase tracking-widest">
            {slides[safeIndex].title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
            disabled={safeIndex === 0}
            className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-300 disabled:opacity-40 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => Math.min(total - 1, prev + 1))
            }
            disabled={safeIndex === total - 1}
            className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-300 disabled:opacity-40 flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full">
              {slide.content}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`h-2 w-2 rounded-full ${
              idx === safeIndex ? "bg-gold-500" : "bg-white/10"
            }`}
            aria-label={`Go to ${slide.title}`}
          />
        ))}
      </div>
    </div>
  );
};
