import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HistoryTable } from '@/components/admin/history-table';
import type { Tables } from '@/lib/supabase/types';

type ContentVersionRow = Tables<'content_versions'>;

interface HistoryPageProps {
  searchParams: Promise<{ restored?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const showRestored = params.restored === 'true';

  // Fetch versions ordered by changed_at DESC
  // This will get all versions - we'll handle the "10 per key" limit in display
  const { data: versions } = await supabase
    .from('content_versions')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(100);

  // Type the versions
  const typedVersions = (versions || []) as ContentVersionRow[];

  // Group by content_key and limit to 10 per key
  const versionsByKey: Record<string, ContentVersionRow[]> = {};
  for (const version of typedVersions) {
    if (!versionsByKey[version.content_key]) {
      versionsByKey[version.content_key] = [];
    }
    if (versionsByKey[version.content_key].length < 10) {
      versionsByKey[version.content_key].push(version);
    }
  }

  // Flatten back to array, sorted by date
  const limitedVersions = Object.values(versionsByKey)
    .flat()
    .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

  // Get unique content keys for filter (future enhancement)
  const contentKeys = [...new Set(typedVersions.map(v => v.content_key))];

  return (
    <div>
      {/* Success Message */}
      {showRestored && (
        <div className="mb-6 rounded-lg bg-green-900/30 border border-green-500/30 px-4 py-3">
          <p className="text-green-400 text-sm font-medium">
            Content restored successfully! The previous version has been applied.
          </p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Change History</h1>
        <p className="mt-2 text-muted-foreground">
          View and restore previous versions of your content. Up to 10 versions are kept for each content key.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-2xl font-bold text-white">{limitedVersions.length}</p>
          <p className="text-sm text-muted-foreground">Total Versions</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-2xl font-bold text-white">{contentKeys.length}</p>
          <p className="text-sm text-muted-foreground">Content Keys</p>
        </div>
        {limitedVersions[0] && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white truncate">
              {limitedVersions[0].content_key}
            </p>
            <p className="text-sm text-muted-foreground">Most Recent Change</p>
          </div>
        )}
      </div>

      {/* History Table */}
      <HistoryTable versions={limitedVersions} />

      {/* Help Text */}
      <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="font-medium text-white mb-2">How versioning works</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- Every time content is published, the previous value is saved to history</li>
          <li>- Click "Restore" to rollback content to that version</li>
          <li>- Restoring creates a new version of the current content before overwriting</li>
          <li>- Up to 10 versions are kept per content key (oldest are automatically removed)</li>
        </ul>
      </div>
    </div>
  );
}
