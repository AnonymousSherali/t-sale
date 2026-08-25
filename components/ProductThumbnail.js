import { useState } from 'react';

/**
 * Product image with a placeholder fallback. Tracks the failed state in React
 * instead of poking at sibling DOM nodes, which breaks when the placeholder
 * isn't rendered.
 */
export default function ProductThumbnail({ product, className = 'w-12 h-12' }) {
  const [failed, setFailed] = useState(false);
  const src = product?.images?.[0];

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={product.title || 'Mahsulot rasmi'}
        className={`${className} object-cover rounded mx-auto`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`${className} bg-gray-200 rounded mx-auto flex items-center justify-center`}>
      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}
