import React, { useState, useEffect } from 'react';
import { Package, RefreshCw } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  isDark?: boolean;
  showChangeButton?: boolean;
  onChangeClick?: () => void;
  onClick?: () => void;
  isLoading?: boolean;
  buttonLabel?: string;
  buttonTitle?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Ürün Görseli',
  className = 'w-12 h-12 rounded-xl',
  isDark = false,
  showChangeButton = false,
  onChangeClick,
  onClick,
  isLoading = false,
  buttonLabel = 'eMAG\'den Çek',
  buttonTitle = 'Görseli eMAG\'den Getir',
  iconSize = 'md',
  referrerPolicy = 'no-referrer'
}) => {
  const [hasError, setHasError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);

  // Reset error state if the src changes (e.g. after user updates image URL or loads new product)
  useEffect(() => {
    setHasError(false);
    setUseProxy(false);
  }, [src]);

  const cleanSrc = src?.trim() || '';

  const isInvalidSrc =
    !cleanSrc ||
    cleanSrc.includes('unsplash.com') ||
    cleanSrc === '/products/no_image.svg' ||
    hasError;

  const getPackageIconSize = () => {
    switch (iconSize) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-5 h-5';
    }
  };

  const currentSrc = useProxy && cleanSrc.startsWith('http')
    ? `/api/image-proxy?url=${encodeURIComponent(cleanSrc)}`
    : cleanSrc;

  const handleBoxClick = (e: React.MouseEvent) => {
    if (isLoading) return;
    if (onClick) {
      e.stopPropagation();
      onClick();
    } else if (onChangeClick) {
      e.stopPropagation();
      onChangeClick();
    }
  };

  return (
    <div
      onClick={handleBoxClick}
      className={`relative group/img shrink-0 overflow-hidden cursor-pointer ${className}`}
    >
      {isLoading ? (
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-1 text-center select-none border transition-colors ${
            isDark
              ? 'bg-blue-950/60 border-blue-800 text-blue-300'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}
        >
          <RefreshCw className={`${getPackageIconSize()} animate-spin mb-0.5`} />
          <span className="text-[7px] font-bold tracking-tight opacity-90 leading-none">
            Çekiliyor...
          </span>
        </div>
      ) : isInvalidSrc ? (
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-1 text-center select-none transition-colors border group-hover/img:border-blue-400 ${
            isDark
              ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400 group-hover/img:bg-zinc-800'
              : 'bg-slate-100/90 border-slate-200 text-slate-400 group-hover/img:bg-blue-50/50'
          }`}
          title={alt || 'Görsele tıklayarak eMAG\'den resmi çekin'}
        >
          <div className="flex items-center justify-center">
            <Package className={`${getPackageIconSize()} stroke-[1.75] opacity-80 group-hover/img:scale-110 transition-transform text-blue-600`} />
          </div>
          <span className="text-[8px] font-bold tracking-tight opacity-75 mt-0.5 leading-none line-clamp-1 group-hover/img:text-blue-600">
            eMAG'den Çek
          </span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          referrerPolicy={referrerPolicy}
          className={`w-full h-full object-cover shrink-0 border ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'
          }`}
          onError={() => {
            if (!useProxy && cleanSrc.startsWith('http')) {
              // Try backend image proxy if direct load fails (e.g. CORS/Referrer policy on eMAG CDN)
              setUseProxy(true);
            } else {
              setHasError(true);
            }
          }}
        />
      )}

      {showChangeButton && (onChangeClick || onClick) && !isLoading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
            else if (onChangeClick) onChangeClick();
          }}
          className="absolute inset-0 bg-black/70 hover:bg-black/85 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-[8px] font-bold p-0.5 text-center cursor-pointer shadow-sm z-10"
          title={buttonTitle}
        >
          <RefreshCw className="w-3.5 h-3.5 mb-0.5 text-blue-400" />
          <span>{buttonLabel}</span>
        </button>
      )}
    </div>
  );
};
