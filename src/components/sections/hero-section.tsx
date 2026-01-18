import { getContent, getImageContent } from '@/lib/content/queries';
import { VideoHeroEditable } from '@/components/ui/video-hero-editable';
import { Button } from '@/components/ui/button';
import { EditableText } from '@/components/editable/editable-text';

export async function HeroSection() {
  const [headline, subtitle, ctaPrimary, ctaSecondary, heroPoster] = await Promise.all([
    getContent('hero.headline'),
    getContent('hero.subtitle'),
    getContent('hero.cta_primary'),
    getContent('hero.cta_secondary'),
    getImageContent('hero.poster'),
  ]);

  return (
    <VideoHeroEditable
      videoSrc="/videos/hero.mp4"
      posterSrc={heroPoster.url}
      posterAlt={heroPoster.alt}
      posterContentKey="hero.poster"
    >
      <div className="text-center max-w-4xl mx-auto">
        <EditableText
          contentKey="hero.headline"
          as="h1"
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6"
          page="homepage"
          section="hero"
        >
          {headline}
        </EditableText>
        <EditableText
          contentKey="hero.subtitle"
          as="p"
          className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          page="homepage"
          section="hero"
        >
          {subtitle}
        </EditableText>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            href="https://riseupyouthfootball.com/register"
          >
            <EditableText
              contentKey="hero.cta_primary"
              as="span"
              page="homepage"
              section="hero"
            >
              {ctaPrimary}
            </EditableText>
          </Button>
          <Button
            variant="outline"
            size="lg"
            href="#programs"
          >
            <EditableText
              contentKey="hero.cta_secondary"
              as="span"
              page="homepage"
              section="hero"
            >
              {ctaSecondary}
            </EditableText>
          </Button>
        </div>
      </div>
    </VideoHeroEditable>
  );
}
