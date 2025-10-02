import { supabase } from './supabase';

export interface AppContentText {
  id: string;
  content_key: string;
  section: string;
  component: string;
  current_text: string;
  description?: string;
  last_updated_by?: string;
  last_updated_at: string;
  created_at: string;
}

export interface ContentHistory {
  id: string;
  content_id: string;
  previous_text: string;
  changed_by?: string;
  changed_at: string;
  change_reason?: string;
}

// Cache for content to improve performance
let contentCache: Map<string, AppContentText> = new Map();
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Real-time subscription for content updates
let contentSubscription: any = null;

export class ContentService {
  private static instance: ContentService;
  
  private constructor() {
    this.initializeRealtimeSubscription();
  }
  
  public static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  private initializeRealtimeSubscription() {
    // Subscribe to content changes for real-time updates
    contentSubscription = supabase
      .channel('app_content_text_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_content_text'
        },
        (payload) => {
          this.handleContentChange(payload);
        }
      )
      .subscribe();
  }

  private handleContentChange(payload: any) {
    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      const content = payload.new as AppContentText;
      contentCache.set(content.content_key, content);
    } else if (payload.eventType === 'DELETE') {
      const content = payload.old as AppContentText;
      contentCache.delete(content.content_key);
    }
    
    // Invalidate cache to force refresh
    cacheTimestamp = 0;
  }

  private isCacheValid(): boolean {
    return Date.now() - cacheTimestamp < CACHE_DURATION;
  }

  private async loadContentToCache(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('app_content_text')
        .select('*')
        .order('content_key');

      if (error) {
        console.error('Error loading content:', error);
        throw error;
      }

      // Clear existing cache
      contentCache.clear();
      
      // Populate cache
      data?.forEach((content: AppContentText) => {
        contentCache.set(content.content_key, content);
      });
      
      cacheTimestamp = Date.now();
      } catch (error) {
      console.error('Failed to load content to cache:', error);
      throw error;
    }
  }

  /**
   * Get content text by key with caching
   */
  public async getContent(key: string): Promise<string | null> {
    try {
      // Check cache first
      if (!this.isCacheValid()) {
        await this.loadContentToCache();
      }

      const content = contentCache.get(key);
      return content?.current_text || null;
    } catch (error) {
      console.error(`Error getting content for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Get content with fallback to default text
   */
  public async getContentWithFallback(key: string, fallback: string): Promise<string> {
    const content = await this.getContent(key);
    return content || fallback;
  }

  /**
   * Get JSON content with fallback to default object
   */
  public async getJsonContent<T>(key: string, fallback: T): Promise<T> {
    try {
      const content = await this.getContent(key);
      if (!content) return fallback;
      
      return JSON.parse(content) as T;
    } catch (error) {
      console.error(`Error parsing JSON content for key "${key}":`, error);
      return fallback;
    }
  }

  /**
   * Get content with placeholder replacement
   */
  public async getContentWithPlaceholders(key: string, placeholders: Record<string, string>): Promise<string> {
    const content = await this.getContent(key);
    if (!content) return '';

    let result = content;
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      result = result.replace(new RegExp(`{${placeholder}}`, 'g'), value);
    });

    return result;
  }

  /**
   * Get all content for a specific section
   */
  public async getSectionContent(section: string): Promise<AppContentText[]> {
    try {
      if (!this.isCacheValid()) {
        await this.loadContentToCache();
      }

      return Array.from(contentCache.values()).filter(
        content => content.section === section
      );
    } catch (error) {
      console.error(`Error getting section content for "${section}":`, error);
      return [];
    }
  }

  /**
   * Get all content grouped by section
   */
  public async getAllContent(): Promise<Map<string, AppContentText[]>> {
    try {
      if (!this.isCacheValid()) {
        await this.loadContentToCache();
      }

      const grouped = new Map<string, AppContentText[]>();
      
      contentCache.forEach((content) => {
        if (!grouped.has(content.section)) {
          grouped.set(content.section, []);
        }
        grouped.get(content.section)!.push(content);
      });

      return grouped;
    } catch (error) {
      console.error('Error getting all content:', error);
      return new Map();
    }
  }

  /**
   * Search content by key or description
   */
  public async searchContent(query: string): Promise<AppContentText[]> {
    try {
      if (!this.isCacheValid()) {
        await this.loadContentToCache();
      }

      const searchTerm = query.toLowerCase();
      return Array.from(contentCache.values()).filter(
        content => 
          content.content_key.toLowerCase().includes(searchTerm) ||
          content.current_text.toLowerCase().includes(searchTerm) ||
          (content.description && content.description.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error(`Error searching content for "${query}":`, error);
      return [];
    }
  }

  /**
   * Update content (super admin only)
   */
  public async updateContent(
    contentKey: string, 
    newText: string, 
    userId: string,
    changeReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Derive sensible defaults for section/component if we need to create the row
      const infer = (key: string): { section: string; component: string } => {
        const parts = (key || '').split('.');
        const section = parts[0] || 'general';
        const component = parts[1] || 'misc';
        return { section, component };
      };
      const { section, component } = infer(contentKey);

      // Use upsert so updates also create the row if it does not exist
      const { data, error } = await supabase
        .from('app_content_text')
        .upsert({
          content_key: contentKey,
          section,
          component,
          current_text: newText,
          description: changeReason || undefined,
          last_updated_by: userId,
          last_updated_at: new Date().toISOString()
        }, { onConflict: 'content_key' })
        .select()
        .single();

      if (error) {
        console.error('Error updating content:', error);
        return { success: false, error: error.message };
      }

      // Update cache
      if (data) {
        contentCache.set(data.content_key, data);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating content:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get content history (super admin only)
   */
  public async getContentHistory(contentId: string): Promise<ContentHistory[]> {
    try {
      const { data, error } = await supabase
        .from('app_content_text_history')
        .select('*')
        .eq('content_id', contentId)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('Error getting content history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting content history:', error);
      return [];
    }
  }

  /**
   * Revert content to previous version (super admin only)
   */
  public async revertContent(
    contentId: string, 
    historyId: string, 
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the history entry
      const { data: historyEntry, error: historyError } = await supabase
        .from('app_content_text_history')
        .select('*')
        .eq('id', historyId)
        .single();

      if (historyError || !historyEntry) {
        return { success: false, error: 'History entry not found' };
      }

      // Update content with previous text
      const { error: updateError } = await supabase
        .from('app_content_text')
        .update({
          current_text: historyEntry.previous_text,
          last_updated_by: userId,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (updateError) {
        console.error('Error reverting content:', updateError);
        return { success: false, error: updateError.message };
      }

      // Invalidate cache to force refresh
      cacheTimestamp = 0;

      return { success: true };
    } catch (error: any) {
      console.error('Error reverting content:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create new content entry (super admin only)
   */
  public async createContent(
    contentKey: string,
    section: string,
    component: string,
    text: string,
    description?: string,
    userId?: string
  ): Promise<{ success: boolean; error?: string; data?: AppContentText }> {
    try {
      const { data, error } = await supabase
        .from('app_content_text')
        .insert({
          content_key: contentKey,
          section,
          component,
          current_text: text,
          description,
          last_updated_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating content:', error);
        return { success: false, error: error.message };
      }

      // Update cache
      if (data) {
        contentCache.set(data.content_key, data);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating content:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete content entry (super admin only)
   */
  public async deleteContent(contentKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('app_content_text')
        .delete()
        .eq('content_key', contentKey);

      if (error) {
        console.error('Error deleting content:', error);
        return { success: false, error: error.message };
      }

      // Remove from cache
      contentCache.delete(contentKey);

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting content:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  public clearCache(): void {
    contentCache.clear();
    cacheTimestamp = 0;
  }

  /**
   * Cleanup method to unsubscribe from real-time updates
   */
  public cleanup(): void {
    if (contentSubscription) {
      supabase.removeChannel(contentSubscription);
      contentSubscription = null;
    }
  }
}

// Export singleton instance
export const contentService = ContentService.getInstance();

// Convenience functions for common use cases
export const getText = (key: string, fallback: string = ''): Promise<string> => {
  return contentService.getContentWithFallback(key, fallback);
};

export const getTextWithPlaceholders = (
  key: string, 
  placeholders: Record<string, string>, 
  fallback: string = ''
): Promise<string> => {
  return contentService.getContentWithPlaceholders(key, placeholders).then(
    result => result || fallback
  );
};
