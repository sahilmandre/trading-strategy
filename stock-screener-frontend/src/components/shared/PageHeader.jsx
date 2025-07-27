// File: src/components/shared/PageHeader.jsx

import React from 'react';

/**
 * A reusable component for displaying a consistent page title and subtitle.
 * @param {object} props - The component props.
 * @param {string} props.title - The main title of the page.
 * @param {string} [props.subtitle] - An optional subtitle or description.
 */
export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-lg text-gray-400">{subtitle}</p>}
    </div>
  );
}
