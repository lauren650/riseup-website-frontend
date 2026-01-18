import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/types';

type AnnouncementBarRow = Tables<'announcement_bar'>;

export async function AnnouncementBar() {
  try {
    const supabase = await createClient();

    const { data: announcement } = await supabase
      .from('announcement_bar')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!announcement) return null;

    // Type the announcement
    const bar = announcement as AnnouncementBarRow;

    return (
      <div className="bg-accent text-white py-2 px-4 text-center text-sm">
        <span>{bar.text}</span>
        {bar.link_url && (
          <a
            href={bar.link_url}
            className="ml-2 underline hover:no-underline font-medium"
          >
            {bar.link_text || 'Learn more'}
          </a>
        )}
      </div>
    );
  } catch {
    // Database not available - don't show announcement bar
    return null;
  }
}
