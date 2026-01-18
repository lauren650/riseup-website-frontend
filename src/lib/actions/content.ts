'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Tables } from '@/lib/supabase/types';

type ContentDraftRow = Tables<'content_drafts'>;
type ContentVersionRow = Tables<'content_versions'>;

/**
 * Publish a draft - applies changes to live content
 */
export async function publishDraft(formData: FormData) {
  const draftId = formData.get('draftId') as string;
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get draft
  const { data: draft, error: draftError } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (draftError || !draft) throw new Error('Draft not found');

  // Type the draft
  const draftData = draft as ContentDraftRow;

  // Handle different draft types
  if (draftData.draft_type === 'text') {
    // Upsert to site_content
    await supabase
      .from('site_content')
      .upsert({
        content_key: draftData.content_key,
        content: draftData.content,
        content_type: 'text',
        updated_at: new Date().toISOString()
      }, { onConflict: 'content_key' });
  } else if (draftData.draft_type === 'announcement') {
    const contentObj = draftData.content as Record<string, unknown>;
    const action = contentObj?.action as string;

    if (action === 'add' || action === 'update') {
      // Deactivate existing and insert new
      await supabase
        .from('announcement_bar')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('is_active', true);

      await supabase.from('announcement_bar').insert({
        text: contentObj.text as string,
        link_url: (contentObj.linkUrl as string) || null,
        link_text: (contentObj.linkText as string) || null,
        is_active: true,
      });
    } else if (action === 'remove') {
      await supabase
        .from('announcement_bar')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('is_active', true);
    }
  } else if (draftData.draft_type === 'visibility') {
    const contentObj = draftData.content as Record<string, unknown>;
    await supabase
      .from('section_visibility')
      .upsert({
        section_key: draftData.content_key,
        is_visible: contentObj.visible as boolean,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section_key' });
  }

  // Delete the draft
  await supabase.from('content_drafts').delete().eq('id', draftId);

  // Revalidate affected pages
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/flag-football');
  revalidatePath('/tackle-football');
  revalidatePath('/academies-clinics');

  redirect('/admin/dashboard?published=true');
}

/**
 * Cancel a draft - discards changes without publishing
 */
export async function cancelDraft(formData: FormData) {
  const draftId = formData.get('draftId') as string;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await supabase.from('content_drafts').delete().eq('id', draftId);

  redirect('/admin/dashboard?cancelled=true');
}

/**
 * Rollback to a previous version
 */
export async function rollbackToVersion(formData: FormData) {
  const versionIdStr = formData.get('versionId') as string;
  const versionId = parseInt(versionIdStr, 10);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get the version
  const { data: version } = await supabase
    .from('content_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (!version) throw new Error('Version not found');

  // Type the version
  const versionData = version as ContentVersionRow;

  // Update current content (trigger will auto-version current state)
  await supabase
    .from('site_content')
    .update({
      content: versionData.content,
      updated_at: new Date().toISOString()
    })
    .eq('content_key', versionData.content_key);

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/flag-football');
  revalidatePath('/tackle-football');
  revalidatePath('/academies-clinics');

  redirect('/admin/dashboard/history?restored=true');
}
