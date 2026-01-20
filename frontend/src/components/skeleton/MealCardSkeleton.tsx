import React from 'react';

export const MealCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse w-full max-w-[420px] mx-auto md:max-w-none">
      <div className="h-56 sm:h-64 lg:h-72 bg-gray-100"></div>
      <div className="p-6 sm:p-8 lg:p-10 space-y-4">
        <div className="h-6 bg-gray-100 rounded w-3/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`meal-skeleton-stat-${idx}`} className="h-10 bg-gray-100 rounded"></div>
          ))}
        </div>
        <div className="h-12 bg-gray-100 rounded-[1.5rem]"></div>
      </div>
    </div>
  );
};
