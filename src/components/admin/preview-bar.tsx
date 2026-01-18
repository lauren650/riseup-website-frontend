'use client';

import { publishDraft, cancelDraft } from '@/lib/actions/content';

interface PreviewBarProps {
  draftId: string;
}

export function PreviewBar({ draftId }: PreviewBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black py-3 px-6 shadow-lg">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-amber-700 animate-pulse" />
          <span className="font-medium">Preview Mode</span>
          <span className="text-amber-900">Changes not yet published</span>
        </div>

        <div className="flex items-center gap-3">
          <form action={cancelDraft}>
            <input type="hidden" name="draftId" value={draftId} />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-amber-900 hover:text-black transition-colors"
            >
              Cancel
            </button>
          </form>

          <form action={publishDraft}>
            <input type="hidden" name="draftId" value={draftId} />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Publish Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
