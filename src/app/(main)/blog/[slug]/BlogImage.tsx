'use client';

import { useState } from 'react';

interface BlogImageProps {
  src: string;
  alt: string;
  className: string;
}

export default function BlogImage({ src, alt, className }: BlogImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return null; // Don't render anything if image fails to load
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}