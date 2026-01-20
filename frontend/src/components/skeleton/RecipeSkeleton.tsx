import React from 'react';

export const RecipeSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="h-56 bg-gray-100"></div>
      <div className="p-8 space-y-4">
        <div className="h-5 bg-gray-100 rounded w-3/4"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
          <div className="h-6 w-14 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
