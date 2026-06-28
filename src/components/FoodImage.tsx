import { useState } from 'react';

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  emoji?: string;
  priority?: boolean;
}

export default function FoodImage({ src, alt, className = '', fallback, emoji, priority = false }: FoodImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-[#111827] ${className}`}>
        <span className="text-2xl">{emoji ?? '🍽️'}</span>
      </div>
    );
  }

  return (
    <img
      src={failed && fallback ? fallback : src}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      fetchPriority={priority ? 'high' : 'low'}
      sizes="(max-width: 640px) 50vw, 400px"
      onError={() => setFailed(true)}
    />
  );
}