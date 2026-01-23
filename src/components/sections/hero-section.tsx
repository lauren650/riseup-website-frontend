import { getContent, getImageContent } from '@/lib/content/queries';
import { VideoHeroEditable } from '@/components/ui/video-hero-editable';
import { EditableText } from '@/components/editable/editable-text';
import { DonationFormHorizontal } from '@/components/donations/donation-form-horizontal';

export async function HeroSection() {
  const [headline, heroPoster, heroVideo] = await Promise.all([
    getContent('hero.headline'),
    getImageContent('hero.poster'),
    getImageContent('hero.video'),
  ]);

  return (
    <VideoHeroEditable
      videoSrc={heroVideo.url}
      posterSrc={heroPoster.url}
      videoContentKey="hero.video"
    >
      <div className="text-center max-w-7xl mx-auto px-4 sm:px-6">
        <EditableText
          contentKey="hero.headline"
          as="h1"
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight"
          page="homepage"
          section="hero"
        >
          {headline}
        </EditableText>

        {/* Donation Form */}
        <div className="mt-6 sm:mt-8">
          <DonationFormHorizontal />
        </div>
      </div>
    </VideoHeroEditable>
  );
}
