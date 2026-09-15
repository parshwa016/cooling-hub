import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 4.5, count = null }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center text-[#C8A96B]">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? 'fill-[#C8A96B] text-[#C8A96B]'
                : i === fullStars && hasHalf
                ? 'fill-[#C8A96B]/50 text-[#C8A96B]'
                : 'text-[#E2E0DB] dark:text-[#333333]'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-[#111111] dark:text-[#F7F6F2] ml-1">{rating}</span>
      {count !== null && (
        <span className="text-[11px] text-[#858585] ml-0.5">({count})</span>
      )}
    </div>
  );
}
