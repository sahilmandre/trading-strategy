// File: src/components/shared/Loader.jsx

import React from 'react';

/**
 * A simple, centered loading spinner component.
 * Uses Tailwind CSS for styling and animation.
 */
export default function Loader() {
  return (
    <div className="flex justify-center items-center py-12">
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
