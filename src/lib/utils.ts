import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeCloudinaryUrl(url: string, width = 400): string {
  if (!url || !url.includes('cloudinary.com/')) return url;
  if (url.includes('/upload/')) {
    const parts = url.split('/upload/');
    // If it already has transformations (e.g. w_800), skip
    if (parts[1].match(/^[a-z_]+,/)) return url; 
    return `${parts[0]}/upload/c_fill,w_${width},q_auto,f_auto/${parts[1]}`;
  }
  return url;
}
