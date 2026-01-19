import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhotoContentBlockProps {
  imageSrc: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  title: string;
  children: React.ReactNode;
  className?: string;
  darkOverlay?: boolean;
}

export function PhotoContentBlock({
  imageSrc,
  imageAlt,
  imagePosition = 'left',
  title,
  children,
  className,
  darkOverlay = false,
}: PhotoContentBlockProps) {
  return (
    <div
      className={cn(
        'grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16',
        className
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'relative h-[300px] overflow-hidden rounded-xl md:h-auto',
          imagePosition === 'right' && 'md:order-2'
        )}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {darkOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center">
        <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          {title}
        </h3>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
