import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PreviewBar } from '@/components/admin/preview-bar';
import { getContent, getImageContent, DEFAULT_TEXT_CONTENT } from '@/lib/content/queries';
import type { TextContentKey, ImageContentKey } from '@/types/content';
import type { Tables } from '@/lib/supabase/types';

type ContentDraftRow = Tables<'content_drafts'>;

interface PreviewPageProps {
  searchParams: Promise<{ draft?: string }>;
}

// Helper to determine which page a content key affects
function getPreviewPageUrl(contentKey: string): string {
  if (contentKey.startsWith('hero.') || contentKey === 'announcement_bar') {
    return '/';
  }
  if (contentKey.startsWith('about.')) {
    return '/about';
  }
  return '/';
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const draftId = params.draft;

  if (!draftId) {
    redirect('/admin/dashboard');
  }

  // Fetch draft
  const { data: draft, error } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (error || !draft) {
    redirect('/admin/dashboard');
  }

  // Type the draft
  const draftData = draft as ContentDraftRow;

  // Get current content for comparison
  let currentValue = '';
  let newValue = '';
  let changeDescription = '';

  if (draftData.draft_type === 'text') {
    const contentKey = draftData.content_key;
    // Check if this is a known text content key
    if (contentKey in DEFAULT_TEXT_CONTENT) {
      currentValue = await getContent(contentKey as TextContentKey);
    }
    const contentObj = draftData.content as Record<string, unknown>;
    newValue = (contentObj?.text as string) || '';
    changeDescription = `Text change for "${draftData.content_key}"`;
  } else if (draftData.draft_type === 'image') {
    const contentKey = draftData.content_key as ImageContentKey;
    const currentImage = await getImageContent(contentKey);
    currentValue = currentImage.url;
    const contentObj = draftData.content as Record<string, unknown>;
    newValue = (contentObj?.url as string) || '';
    changeDescription = `Image change for "${draftData.content_key}"`;
  } else if (draftData.draft_type === 'announcement') {
    const contentObj = draftData.content as Record<string, unknown>;
    const action = contentObj?.action as string;
    if (action === 'remove') {
      changeDescription = 'Remove announcement bar';
    } else {
      newValue = (contentObj?.text as string) || '';
      changeDescription = `Announcement: "${newValue}"`;
    }
  } else if (draftData.draft_type === 'visibility') {
    const contentObj = draftData.content as Record<string, unknown>;
    const visible = contentObj?.visible as boolean;
    changeDescription = `${visible ? 'Show' : 'Hide'} section "${draftData.content_key}"`;
  }

  const previewUrl = getPreviewPageUrl(draftData.content_key);

  return (
    <div className="min-h-screen bg-black">
      <PreviewBar draftId={draftId} />

      {/* Spacer for fixed preview bar */}
      <div className="h-16" />

      {/* Change Summary */}
      <div className="border-b border-white/10 bg-black/80 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-2xl font-bold text-white mb-4">Preview Changes</h1>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Change Type</span>
                <p className="text-white font-medium">{draftData.draft_type}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Content Key</span>
                <p className="text-white font-mono text-sm">{draftData.content_key}</p>
              </div>

              {draftData.draft_type === 'text' && (
                <>
                  <div>
                    <span className="text-sm text-muted-foreground">Current Value</span>
                    <p className="text-white/60 mt-1 p-3 rounded bg-red-900/20 border border-red-500/30">
                      {currentValue || <em className="text-muted-foreground">Not set</em>}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">New Value</span>
                    <p className="text-white mt-1 p-3 rounded bg-green-900/20 border border-green-500/30">
                      {newValue}
                    </p>
                  </div>
                </>
              )}

              {draftData.draft_type === 'announcement' && (
                <div>
                  <span className="text-sm text-muted-foreground">Action</span>
                  <p className="text-white mt-1">{changeDescription}</p>
                </div>
              )}

              {draftData.draft_type === 'visibility' && (
                <div>
                  <span className="text-sm text-muted-foreground">Action</span>
                  <p className="text-white mt-1">{changeDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview iframe */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <h2 className="text-lg font-semibold text-white mb-4">Page Preview</h2>
        <div className="rounded-lg border border-white/10 overflow-hidden bg-white">
          <iframe
            src={`${previewUrl}?preview=${draftId}`}
            className="w-full h-[600px] border-0"
            title="Page Preview"
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Note: The preview above shows the current live page. After publishing, your changes will appear on the site.
        </p>
      </div>
    </div>
  );
}
