import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CoachBioProps {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  className?: string;
}

export function CoachBio({
  name,
  role,
  bio,
  imageUrl,
  className,
}: CoachBioProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 md:flex-row md:items-start",
        className
      )}
    >
      <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-full bg-white/10 md:h-40 md:w-40">
        <Image
          src={imageUrl}
          alt={`${name}, ${role}`}
          fill
          sizes="(max-width: 768px) 128px, 160px"
          className="object-cover"
          priority={false}
        />
      </div>
      <div className="text-center md:text-left">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-sm font-medium text-accent">{role}</p>
        <p className="mt-2 text-muted-foreground">{bio}</p>
      </div>
    </div>
  );
}
