import { cn } from '@/lib/utils';

interface InfoItem {
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}

interface QuickReferenceProps {
  title: string;
  subtitle?: string;
  subtitleAccent?: boolean;
  items: InfoItem[];
  className?: string;
  columns?: 1 | 2 | 3;
}

export function QuickReference({
  title,
  subtitle,
  subtitleAccent = false,
  items,
  className,
  columns = 2,
}: QuickReferenceProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 p-6 md:p-8',
        className
      )}
    >
      <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">{title}</h3>
      {subtitle && (
        <p className={cn(
          "mb-6 text-base md:text-lg",
          subtitleAccent ? "text-accent font-semibold" : "text-muted-foreground"
        )}>{subtitle}</p>
      )}
      {!subtitle && <div className="mb-6" />}
      <div
        className={cn(
          'grid gap-4',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 md:grid-cols-2',
          columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'rounded-lg border border-white/10 bg-background p-4 transition-all',
              item.highlight &&
                'border-accent/30 bg-accent/5 ring-1 ring-accent/20'
            )}
          >
            <dt className="mb-2 text-sm font-medium text-muted-foreground">
              {item.label}
            </dt>
            <dd
              className={cn(
                'text-base font-semibold',
                item.highlight ? 'text-accent' : 'text-white'
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  important?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {items.map((item, index) => (
        <div key={index} className="relative flex gap-4 md:gap-6">
          {/* Timeline line and dot */}
          <div className="relative flex flex-col items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                item.important
                  ? 'border-accent bg-accent/20'
                  : 'border-white/20 bg-white/5'
              )}
            >
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  item.important ? 'bg-accent' : 'bg-white/40'
                )}
              />
            </div>
            {index < items.length - 1 && (
              <div className="h-full w-px flex-1 bg-white/10" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-8">
            <div
              className={cn(
                'mb-1 text-sm font-semibold',
                item.important ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              {item.date}
            </div>
            <h4 className="mb-2 text-lg font-bold text-white">{item.title}</h4>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
