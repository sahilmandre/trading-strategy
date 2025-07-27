// File: src/components/shared/ErrorMessage.jsx

import React from 'react';

/**
 * A component to display a standardized error message.
 * @param {object} props - The component props.
 * @param {string} [props.message='An unexpected error occurred.'] - The error message to display.
 */
export default function ErrorMessage({ message = 'An unexpected error occurred.' }) {
  return (
    <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-md relative text-center" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
