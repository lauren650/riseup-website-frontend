import { cn } from "@/lib/utils";

export interface SafetySectionProps {
  protocols: string[];
  className?: string;
}

export function SafetySection({ protocols, className }: SafetySectionProps) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-2xl bg-white/5 p-8 md:p-12">
          <div className="mb-8 flex items-center gap-3">
            {/* Shield icon */}
            <svg
              className="h-8 w-8 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Safety Protocols
            </h2>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {protocols.map((protocol, index) => (
              <li key={index} className="flex items-start gap-3">
                {/* Checkmark icon */}
                <svg
                  className="mt-1 h-5 w-5 flex-shrink-0 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-muted-foreground">{protocol}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
