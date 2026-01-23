/**
 * Payload CMS Query Functions
 * 
 * These functions replace the Supabase queries with Payload's Local API
 * Used by the AI chat interface and inline editing components
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import type { TextContentKey } from '@/types/content'

/**
 * Get content by key from Payload
 */
export async function getContent(contentKey: TextContentKey): Promise<string> {
  try {
    const payload = await getPayload({ config })
    
    const result = await payload.find({
      collection: 'site-content',
      where: {
        contentKey: {
          equals: contentKey,
        },
      },
      limit: 1,
    })
    
    if (result.docs.length === 0) {
      return '' // No content found, return empty string
    }
    
    // Extract text from content
    const doc = result.docs[0]
    
    // Handle different content formats
    if (typeof doc.content === 'object' && doc.content !== null) {
      // If content is an object with a text property
      if ('text' in doc.content && typeof doc.content.text === 'string') {
        return doc.content.text
      }
      // If content is a complex object, stringify it
      return JSON.stringify(doc.content)
    }
    
    // If content is already a string
    if (typeof doc.content === 'string') {
      return doc.content
    }
    
    return ''
  } catch (error) {
    console.error(`Error fetching content for ${contentKey}:`, error)
    return ''
  }
}

/**
 * Get all editable content for listing
 */
export async function getAllEditableContent() {
  try {
    const payload = await getPayload({ config })
    
    const result = await payload.find({
      collection: 'site-content',
      limit: 100,
      sort: 'contentKey',
    })
    
    return result.docs.map(doc => {
      let currentValue = ''
      
      // Extract text from content
      if (typeof doc.content === 'object' && doc.content !== null) {
        if ('text' in doc.content && typeof doc.content.text === 'string') {
          currentValue = doc.content.text
        } else {
          currentValue = JSON.stringify(doc.content)
        }
      } else if (typeof doc.content === 'string') {
        currentValue = doc.content
      }
      
      return {
        contentKey: doc.contentKey,
        currentValue,
        description: `${doc.page || 'General'} - ${doc.section || 'Content'}`,
        page: doc.page,
        section: doc.section,
      }
    })
  } catch (error) {
    console.error('Error fetching all editable content:', error)
    return []
  }
}

/**
 * Create a draft in Payload (using Payload's built-in draft system)
 */
export async function createDraft(
  contentKey: string,
  draftType: 'text' | 'announcement' | 'visibility',
  content: Record<string, unknown>,
  createdBy: string
) {
  try {
    const payload = await getPayload({ config })
    
    if (draftType === 'text') {
      // Find existing content or create new
      const existing = await payload.find({
        collection: 'site-content',
        where: { contentKey: { equals: contentKey } },
        limit: 1,
      })
      
      if (existing.docs.length > 0) {
        // Update existing as draft
        const doc = await payload.update({
          collection: 'site-content',
          id: existing.docs[0].id,
          data: {
            content: content,
          },
          draft: true, // This creates a draft version
        })
        
        return {
          id: doc.id,
          contentKey: doc.contentKey,
          content: doc.content,
        }
      } else {
        // Create new as draft
        const doc = await payload.create({
          collection: 'site-content',
          data: {
            contentKey,
            content,
            contentType: 'text',
          },
          draft: true,
        })
        
        return {
          id: doc.id,
          contentKey: doc.contentKey,
          content: doc.content,
        }
      }
    } else if (draftType === 'announcement') {
      // Update announcement bar global
      const doc = await payload.updateGlobal({
        slug: 'announcement-bar',
        data: {
          text: content.text as string,
          link_url: content.linkUrl as string,
          link_text: content.linkText as string,
          is_active: content.action !== 'remove',
        },
        draft: true,
      })
      
      return {
        id: 'announcement-bar',
        contentKey: 'announcement_bar',
        content,
      }
    } else if (draftType === 'visibility') {
      // Handle section visibility
      const existing = await payload.find({
        collection: 'section-visibility',
        where: { section_key: { equals: contentKey } },
        limit: 1,
      })
      
      if (existing.docs.length > 0) {
        const doc = await payload.update({
          collection: 'section-visibility',
          id: existing.docs[0].id,
          data: {
            is_visible: content.visible as boolean,
          },
          draft: true,
        })
        return { id: doc.id, contentKey, content }
      } else {
        const doc = await payload.create({
          collection: 'section-visibility',
          data: {
            section_key: contentKey,
            is_visible: content.visible as boolean,
          },
          draft: true,
        })
        return { id: doc.id, contentKey, content }
      }
    }
    
    throw new Error(`Unknown draft type: ${draftType}`)
  } catch (error) {
    console.error('Error creating draft:', error)
    throw error
  }
}

/**
 * Publish a draft (Payload's built-in)
 */
export async function publishDraft(id: string, collection: string) {
  try {
    const payload = await getPayload({ config })
    
    // Payload makes this incredibly simple
    const doc = await payload.update({
      collection: collection as any,
      id,
      data: {
        _status: 'published',
      },
    })
    
    return doc
  } catch (error) {
    console.error('Error publishing draft:', error)
    throw error
  }
}

/**
 * Get section visibility
 */
export async function getSectionVisibility(sectionKey: string): Promise<boolean> {
  try {
    const payload = await getPayload({ config })
    
    const result = await payload.find({
      collection: 'section-visibility',
      where: {
        section_key: { equals: sectionKey },
      },
      limit: 1,
    })
    
    if (result.docs.length === 0) {
      return true // Default to visible if not found
    }
    
    return result.docs[0].is_visible ?? true
  } catch (error) {
    console.error(`Error fetching visibility for ${sectionKey}:`, error)
    return true // Default to visible on error
  }
}

/**
 * Get active announcement bar
 */
export async function getAnnouncementBar() {
  try {
    const payload = await getPayload({ config })
    
    const result = await payload.findGlobal({
      slug: 'announcement-bar',
    })
    
    if (!result.is_active) {
      return null
    }
    
    return {
      text: result.text,
      linkUrl: result.link_url,
      linkText: result.link_text,
      isActive: result.is_active,
    }
  } catch (error) {
    console.error('Error fetching announcement bar:', error)
    return null
  }
}

/**
 * Save inline text edit (for EditableText component)
 */
export async function saveInlineText(
  contentKey: string,
  text: string,
  page?: string,
  section?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = await getPayload({ config })
    
    // Find existing content
    const existing = await payload.find({
      collection: 'site-content',
      where: { contentKey: { equals: contentKey } },
      limit: 1,
    })
    
    if (existing.docs.length > 0) {
      // Update existing
      await payload.update({
        collection: 'site-content',
        id: existing.docs[0].id,
        data: {
          content: { text },
        },
      })
    } else {
      // Create new
      await payload.create({
        collection: 'site-content',
        data: {
          contentKey,
          content: { text },
          contentType: 'text',
          page,
          section,
        },
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error saving inline text:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
