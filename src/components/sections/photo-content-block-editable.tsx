"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EditableImage } from '@/components/editable/editable-image';
import { useEditMode } from '@/contexts/edit-mode-context';

interface PhotoContentBlockEditableProps {
  imageSrc: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  title: string;
  children: React.ReactNode;
  className?: string;
  darkOverlay?: boolean;
  contentKey: string;
  page?: string;
  section?: string;
  imageHeight?: string;
  rounded?: boolean;
  wideImage?: boolean;
}

export function PhotoContentBlockEditable({
  imageSrc,
  imageAlt,
  imagePosition: initialPosition = 'left',
  title,
  children,
  className,
  darkOverlay = false,
  contentKey,
  page,
  section,
  imageHeight = 'h-[300px] md:h-auto',
  rounded = true,
  wideImage = false,
  contentAlign = 'center',
}: PhotoContentBlockEditableProps) {
  const { isEditMode } = useEditMode();
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>(initialPosition);

  const togglePosition = () => {
    setImagePosition(prev => prev === 'left' ? 'right' : 'left');
  };

  return (
    <div className="relative">
      {isEditMode && (
        <button
          onClick={togglePosition}
          className="absolute -top-12 left-0 z-10 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 11 21 7 17 3"></polyline>
            <line x1="21" y1="7" x2="9" y2="7"></line>
            <polyline points="7 21 3 17 7 13"></polyline>
            <line x1="3" y1="17" x2="15" y2="17"></line>
          </svg>
          Image: {imagePosition === 'left' ? 'Left' : 'Right'}
        </button>
      )}
      <div
        className={cn(
          'grid gap-8 md:gap-12 lg:gap-16',
          wideImage 
            ? imagePosition === 'right' 
              ? 'md:grid-cols-[2fr_3fr]' 
              : 'md:grid-cols-[3fr_2fr]'
            : 'md:grid-cols-2',
          className
        )}
      >
      {/* Image */}
      <div
        className={cn(
          'relative overflow-hidden',
          imageHeight,
          rounded && 'rounded-xl',
          imagePosition === 'right' && 'md:order-2'
        )}
      >
        <EditableImage
          contentKey={contentKey}
          src={imageSrc}
          alt={imageAlt}
          fill
          objectFit="cover"
          page={page}
          section={section}
          className="object-cover"
        />
        {darkOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex flex-col",
        contentAlign === 'center' ? 'justify-center' : 'justify-start'
      )}>
        <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          {title}
        </h3>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {children}
        </div>
      </div>
      </div>
    </div>
  );
}
