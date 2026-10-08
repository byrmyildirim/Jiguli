import React from 'react';

export const MARKETPLACE_LOGOS = {
  baselinker: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ80ekv8uUG8sAoqL3r86MmB7NEaesIyqxwL_EEqkKQhz33FCOZ4qy5d1k&s=10',
  allegro: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ__I5J_lZElj3WNO43-2DDmbJ_GSsZ68eE_k_04RXU17Ckg-tUfKuBSsIM&s=10',
  emag: 'https://play-lh.googleusercontent.com/jizhe0KDIG-c996ZJ1Vw7N9gi5pqswYwEFO99OLVovKtefL4gm6_PYCYzfHc0vrouX_HlTYpxQ5YPPZl0tB58JM'
} as const;

export interface MarketplaceLogoProps {
  platform: 'allegro' | 'emag' | 'baselinker' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none';
}

export const MarketplaceLogo: React.FC<MarketplaceLogoProps> = ({
  platform,
  size = 'sm',
  className = '',
  rounded = 'md'
}) => {
  const normalized = (platform || '').toLowerCase();
  const logoUrl =
    normalized === 'allegro'
      ? MARKETPLACE_LOGOS.allegro
      : normalized === 'emag'
      ? MARKETPLACE_LOGOS.emag
      : MARKETPLACE_LOGOS.baselinker;

  const sizeClass =
    size === 'xs'
      ? 'w-3.5 h-3.5 min-w-[14px]'
      : size === 'sm'
      ? 'w-4 h-4 min-w-[16px]'
      : size === 'md'
      ? 'w-5 h-5 min-w-[20px]'
      : size === 'lg'
      ? 'w-7 h-7 min-w-[28px]'
      : 'w-9 h-9 min-w-[36px]';

  const roundedClass =
    rounded === 'sm'
      ? 'rounded-sm'
      : rounded === 'md'
      ? 'rounded-md'
      : rounded === 'lg'
      ? 'rounded-lg'
      : rounded === 'xl'
      ? 'rounded-xl'
      : rounded === 'full'
      ? 'rounded-full'
      : '';

  return (
    <img
      src={logoUrl}
      alt={`${platform} logo`}
      className={`object-contain bg-white shrink-0 ${sizeClass} ${roundedClass} ${className}`}
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  );
};
