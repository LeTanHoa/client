import { useRef } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { SingerCard } from './SingerCard.jsx';

export function SingerCarousel({ title, singers = [], loading = false, onSingerClick }) {
  const { isDark } = useTheme();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const canScrollLeft = scrollRef.current?.scrollLeft > 0;
  const canScrollRight =
    scrollRef.current &&
    scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth;

  if (loading) {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <h2 className="text-xl md:text-2xl font-black mb-4">{title}</h2>
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-56 w-40 shrink-0 rounded-xl animate-pulse ${
                isDark ? 'bg-white/10' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!singers || singers.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-6 text-center ${
          isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <h2 className="text-xl md:text-2xl font-black mb-2">{title}</h2>
        <p className={isDark ? 'text-zing-text-secondary' : 'text-slate-600'}>
          Chưa có ca sĩ nào
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 sm:p-6 ${isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl md:text-2xl font-black">{title}</h2>
        </div>

        {/* Scroll Controls */}
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`rounded-lg p-2 transition-all ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20 disabled:opacity-50'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50'
            }`}
            aria-label="Scroll left"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`rounded-lg p-2 transition-all ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20 disabled:opacity-50'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50'
            }`}
            aria-label="Scroll right"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {singers.map((singer, idx) => {
          const keywords = (singer.artist || singer.name || singer).split(' ').join('%20');
          const imageUrl = `https://source.unsplash.com/300x300/?artist,${keywords},music&q=${idx}`;
          
          return (
            <div key={idx} className="shrink-0 w-40 snap-start">
              <SingerCard
                artist={singer.artist || singer.name || singer}
                songCount={singer.songCount || singer.count || 0}
                imageUrl={imageUrl}
                onClick={() => onSingerClick?.(singer)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
