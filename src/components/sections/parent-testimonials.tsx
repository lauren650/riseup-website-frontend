import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  parentName: string;
  playerAge?: string;
  location?: string;
}

interface ParentTestimonialsProps {
  testimonials: Testimonial[];
  className?: string;
}

export function ParentTestimonials({
  testimonials,
  className,
}: ParentTestimonialsProps) {
  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          Parent Voices
        </h2>
        <p className="mb-12 text-center text-lg text-muted-foreground">
          Hear from families who have experienced the RiseUp difference
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-white/10 bg-background p-8 transition-all hover:border-accent/50"
            >
              {/* Quote mark */}
              <div className="mb-4 text-5xl font-bold text-accent opacity-20 transition-opacity group-hover:opacity-40">
                &ldquo;
              </div>

              {/* Quote text */}
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">
                {testimonial.quote}
              </p>

              {/* Attribution */}
              <div className="border-t border-white/10 pt-4">
                <p className="font-semibold text-white">
                  {testimonial.parentName}
                </p>
                {testimonial.playerAge && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Parent of {testimonial.playerAge} player
                  </p>
                )}
                {testimonial.location && (
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                )}
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
