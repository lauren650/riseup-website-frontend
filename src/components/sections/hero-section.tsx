import { VideoHero } from '@/components/ui/video-hero'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <VideoHero
      videoSrc="/videos/hero.mp4"
      posterSrc="/images/hero-poster.jpg"
    >
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
          BUILDING CHAMPIONS ON AND OFF THE FIELD
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Youth football programs for ages 5-14. Building character, discipline, and teamwork through the game we love.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            href="https://riseupyouthfootball.com/register"
          >
            Register Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            href="#programs"
          >
            Learn More
          </Button>
        </div>
      </div>
    </VideoHero>
  )
}
