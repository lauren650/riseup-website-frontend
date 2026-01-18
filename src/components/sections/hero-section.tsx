import { createClient } from '@/lib/supabase/server';
import { VideoHero } from '@/components/ui/video-hero';
import { Button } from '@/components/ui/button';
import { EditableText } from '@/components/editable/editable-text';
import type { ContentKey } from '@/types/content';

// Fallback content when database not seeded
const DEFAULTS: Record<ContentKey, string> = {
  'hero.headline': 'BUILDING CHAMPIONS ON AND OFF THE FIELD',
  'hero.subtitle': 'Youth football programs for ages 5-14. Building character, discipline, and teamwork through the game we love.',
  'hero.cta_primary': 'Register Now',
  'hero.cta_secondary': 'Learn More',
};

async function getHeroContent(key: ContentKey): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('content_key', key)
      .single();

    const contentObj = data?.content as Record<string, unknown> | undefined;
    return (contentObj?.text as string) || DEFAULTS[key];
  } catch {
    // Database not available or not seeded - use fallback
    return DEFAULTS[key];
  }
}

export async function HeroSection() {
  const [headline, subtitle, ctaPrimary, ctaSecondary] = await Promise.all([
    getHeroContent('hero.headline'),
    getHeroContent('hero.subtitle'),
    getHeroContent('hero.cta_primary'),
    getHeroContent('hero.cta_secondary'),
  ]);

  return (
    <VideoHero
      videoSrc="/videos/hero.mp4"
      posterSrc="/images/hero-poster.jpg"
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
    </VideoHero>
  );
}
