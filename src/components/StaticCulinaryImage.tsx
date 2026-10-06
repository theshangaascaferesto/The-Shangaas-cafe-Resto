import React, { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';

interface StaticCulinaryImageProps {
  src: string;
  alt: string;
  className?: string;
  subtitle?: string;
}

export const StaticCulinaryImage: React.FC<StaticCulinaryImageProps> = ({
  src,
  alt,
  className = '',
  subtitle = 'The Shangaas Kitchen',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EFE9DF] text-[#6E655C] p-6 text-center ${className}`}
      >
        <Utensils className="w-6 h-6 text-[#7E5A3B] mb-2 stroke-[1.5]" />
        <span className="font-display text-lg text-[#231F1C]">{alt}</span>
        <span className="text-xs text-[#6E655C] mt-1">{subtitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
