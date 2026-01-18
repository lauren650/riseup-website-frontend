import type { Tables } from '@/lib/supabase/types';
import { rollbackToVersion } from '@/lib/actions/content';

type ContentVersionRow = Tables<'content_versions'>;

interface HistoryTableProps {
  versions: ContentVersionRow[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function HistoryTable({ versions }: HistoryTableProps) {
  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-muted-foreground">No version history found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Version history is created when content is published through the AI chat.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Date/Time
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Content Key
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Previous Value
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {versions.map((version) => {
            const contentObj = version.content as Record<string, unknown>;
            const textValue = (contentObj?.text as string) || JSON.stringify(version.content);

            return (
              <tr key={version.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm text-white">
                  {formatDate(version.changed_at)}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-amber-400">
                  {version.content_key}
                </td>
                <td className="px-4 py-3 text-sm text-white/70">
                  {truncateText(textValue)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={rollbackToVersion} className="inline">
                    <input type="hidden" name="versionId" value={version.id} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-sm font-medium text-amber-400 border border-amber-400/30 rounded-lg hover:bg-amber-400/10 transition-colors"
                    >
                      Restore
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
