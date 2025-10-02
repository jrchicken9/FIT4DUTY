import { useState, useEffect } from 'react';
import { contentService, getText, getTextWithPlaceholders } from '@/lib/contentService';

export interface UseDynamicContentOptions {
  fallback?: string;
  placeholders?: Record<string, string>;
  autoRefresh?: boolean;
}

/**
 * Hook to get dynamic content with caching and fallback support
 */
export function useDynamicContent(
  contentKey: string,
  options: UseDynamicContentOptions = {}
) {
  const { fallback = '', placeholders = {}, autoRefresh = true } = options;
  const [content, setContent] = useState<string>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        let result: string;
        if (Object.keys(placeholders).length > 0) {
          result = await getTextWithPlaceholders(contentKey, placeholders, fallback);
        } else {
          result = await getText(contentKey, fallback);
        }

        if (isMounted) {
          setContent(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load content');
          setContent(fallback);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();

    // Set up real-time updates if autoRefresh is enabled
    if (autoRefresh) {
      const unsubscribe = contentService.subscribeToChanges(contentKey, (newContent) => {
        if (isMounted) {
          let result = newContent;
          if (Object.keys(placeholders).length > 0) {
            Object.entries(placeholders).forEach(([placeholder, value]) => {
              result = result.replace(new RegExp(`{${placeholder}}`, 'g'), value);
            });
          }
          setContent(result);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [contentKey, fallback, autoRefresh, JSON.stringify(placeholders)]);

  return {
    content,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      contentService.clearCache();
    }
  };
}

/**
 * Hook to get multiple dynamic content items at once
 */
export function useMultipleDynamicContent(
  contentKeys: string[],
  options: UseDynamicContentOptions = {}
) {
  const { fallback = '', autoRefresh = true } = options;
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAllContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          contentKeys.map(async (key) => {
            try {
              const content = await getText(key, fallback);
              return { key, content };
            } catch (err) {
              console.error(`Failed to load content for key "${key}":`, err);
              return { key, content: fallback };
            }
          })
        );

        if (isMounted) {
          const newContentMap: Record<string, string> = {};
          results.forEach(({ key, content }) => {
            newContentMap[key] = content;
          });
          setContentMap(newContentMap);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load content');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllContent();

    return () => {
      isMounted = false;
    };
  }, [contentKeys.join(','), fallback, autoRefresh]);

  return {
    contentMap,
    loading,
    error,
    getContent: (key: string) => contentMap[key] || fallback,
    refresh: () => {
      setLoading(true);
      contentService.clearCache();
    }
  };
}

/**
 * Hook to get section content (all content for a specific section)
 */
export function useSectionContent(section: string) {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSectionContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const sectionContent = await contentService.getSectionContent(section);

        if (isMounted) {
          setContent(sectionContent);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load section content');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSectionContent();

    return () => {
      isMounted = false;
    };
  }, [section]);

  return {
    content,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      contentService.clearCache();
    }
  };
}

/**
 * Hook to search content
 */
export function useContentSearch(query: string) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const searchContent = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const searchResults = await contentService.searchContent(query);

        if (isMounted) {
          setResults(searchResults);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to search content');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchContent, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return {
    results,
    loading,
    error
  };
}

// Add subscribeToChanges method to contentService
declare module '@/lib/contentService' {
  interface ContentService {
    subscribeToChanges(contentKey: string, callback: (content: string) => void): () => void;
  }
}

// Extend the contentService with subscription functionality
const originalContentService = contentService;
contentService.subscribeToChanges = (contentKey: string, callback: (content: string) => void) => {
  // This is a simplified implementation - in a real app, you'd want more sophisticated
  // subscription management with proper cleanup
  const interval = setInterval(async () => {
    try {
      const content = await contentService.getContent(contentKey);
      if (content) {
        callback(content);
      }
    } catch (error) {
      console.error('Error in content subscription:', error);
    }
  }, 5000); // Check every 5 seconds

  return () => {
    clearInterval(interval);
  };
};
