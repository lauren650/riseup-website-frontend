import Image from "next/image";

export interface Leader {
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
}

interface LeadershipGridProps {
  leaders: Leader[];
}

export function LeadershipGrid({ leaders }: LeadershipGridProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {leaders.map((leader, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center"
        >
          <div className="relative h-40 w-40 overflow-hidden rounded-full bg-white/10">
            <Image
              src={leader.imageUrl}
              alt={`${leader.name}, ${leader.title}`}
              fill
              sizes="160px"
              className="object-cover"
              priority={false}
            />
          </div>
          <h3 className="mt-4 text-xl font-bold text-white">{leader.name}</h3>
          <p className="text-sm font-medium text-accent">{leader.title}</p>
          <p className="mt-2 text-muted-foreground">{leader.bio}</p>
        </div>
      ))}
    </div>
  );
}
