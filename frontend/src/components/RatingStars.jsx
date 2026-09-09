import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 4.5, count = null }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? 'fill-amber-400 text-amber-400'
                : i === fullStars && hasHalf
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">{rating}</span>
      {count !== null && (
        <span className="text-[11px] text-slate-400 ml-0.5">({count})</span>
      )}
    </div>
  );
}
