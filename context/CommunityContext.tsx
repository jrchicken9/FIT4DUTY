import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export type CommunityPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  post_type: 'question' | 'achievement' | 'tip' | 'discussion' | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Joined data from profiles
  user_name?: string;
  user_avatar?: string;
  // Client-side computed
  isLiked?: boolean;
  comments?: CommunityComment[];
};

export type CommunityComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Joined data from profiles
  user_name?: string;
  user_avatar?: string;
  // Client-side computed
  isLiked?: boolean;
};

type FilterCategory = 'All' | 'Application' | 'Fitness' | 'Testing' | 'Training' | 'General';

type CommunityState = {
  posts: CommunityPost[];
  isLoading: boolean;
  error: string | null;
};

export const [CommunityProvider, useCommunity] = createContextHook(() => {
  const { user } = useAuth();
  const [state, setState] = useState<CommunityState>({
    posts: [],
    isLoading: false,
    error: null,
  });

  // Load posts from Supabase
  const loadPosts = async () => {
    if (!user) {
      console.log('Skipping post load - no user');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Loading community posts from Supabase...');
      
      // Load posts first
      const { data: posts, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error loading posts:', postsError);
        setState(prev => ({ ...prev, isLoading: false, error: postsError.message }));
        return;
      }

      if (!posts || posts.length === 0) {
        setState(prev => ({ ...prev, posts: [], isLoading: false }));
        return;
      }

      // Get unique user IDs from posts
      const userIds = [...new Set(posts.map(p => p.user_id))];
      
      // Load profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Create a map of user profiles
      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Load user's likes for these posts
      const postIds = posts.map(p => p.id);
      const { data: userLikes } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);

      // Transform posts with user data and like status
      const transformedPosts: CommunityPost[] = posts.map(post => {
        const profile = profileMap.get(post.user_id);
        return {
          ...post,
          user_name: profile?.full_name || 'Anonymous',
          user_avatar: profile?.avatar_url || undefined,
          isLiked: likedPostIds.has(post.id),
        };
      });

      console.log(`Loaded ${transformedPosts.length} community posts`);
      setState(prev => ({ ...prev, posts: transformedPosts, isLoading: false }));
    } catch (error: any) {
      console.error('Error loading community posts:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to load posts' 
      }));
    }
  };

  // Load comments for a specific post
  const loadComments = async (postId: string): Promise<CommunityComment[]> => {
    if (!user) {
      return [];
    }

    try {
      console.log('Loading comments for post:', postId);
      
      // Load comments first
      const { data: comments, error: commentsError } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error loading comments:', commentsError);
        return [];
      }

      if (!comments || comments.length === 0) {
        return [];
      }

      // Get unique user IDs from comments
      const userIds = [...new Set(comments.map(c => c.user_id))];
      
      // Load profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Create a map of user profiles
      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Load user's likes for these comments
      const commentIds = comments.map(c => c.id);
      const { data: userLikes } = await supabase
        .from('community_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      const likedCommentIds = new Set(userLikes?.map(like => like.comment_id) || []);

      // Transform comments with user data and like status
      const transformedComments: CommunityComment[] = comments.map(comment => {
        const profile = profileMap.get(comment.user_id);
        return {
          ...comment,
          user_name: profile?.full_name || 'Anonymous',
          user_avatar: profile?.avatar_url || undefined,
          isLiked: likedCommentIds.has(comment.id),
        };
      });

      return transformedComments;
    } catch (error: any) {
      console.error('Error loading comments:', error);
      return [];
    }
  };

  // Create a new post
  const createPost = async (content: string, category: FilterCategory) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to create posts');
      return;
    }

    try {
      console.log('Creating new post...');
      
      // Map category to post_type
      const postTypeMap: Record<FilterCategory, 'question' | 'achievement' | 'tip' | 'discussion'> = {
        'All': 'discussion',
        'Application': 'question',
        'Fitness': 'tip',
        'Testing': 'question',
        'Training': 'tip',
        'General': 'discussion',
      };

      const { data: newPost, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: content.substring(0, 100), // Use first 100 chars as title
          content,
          post_type: postTypeMap[category],
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating post:', error);
        Alert.alert('Error', 'Failed to create post');
        return;
      }

      // Get user profile for the new post
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Add the new post to the state
      const transformedPost: CommunityPost = {
        ...newPost,
        user_name: profile?.full_name || 'Anonymous',
        user_avatar: profile?.avatar_url || undefined,
        isLiked: false,
      };

      setState(prev => ({
        ...prev,
        posts: [transformedPost, ...prev.posts],
      }));

      console.log('Post created successfully');
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  // Like/unlike a post
  const togglePostLike = async (postId: string) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to like posts');
      return;
    }

    try {
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) {
          console.error('Error unliking post:', error);
          return;
        }
      } else {
        // Like the post
        const { error } = await supabase
          .from('community_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });

        if (error) {
          console.error('Error liking post:', error);
          return;
        }
      }

      // Update the post in state
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                isLiked: !p.isLiked,
                likes_count: p.isLiked ? p.likes_count - 1 : p.likes_count + 1
              }
            : p
        ),
      }));
    } catch (error: any) {
      console.error('Error toggling post like:', error);
    }
  };

  // Add a comment to a post
  const addComment = async (postId: string, content: string) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to comment');
      return;
    }

    try {
      console.log('Adding comment to post:', postId);
      
      const { data: newComment, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        Alert.alert('Error', 'Failed to add comment');
        return;
      }

      // Update the post's comment count in state
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(p => 
          p.id === postId 
            ? { ...p, comments_count: p.comments_count + 1 }
            : p
        ),
      }));

      console.log('Comment added successfully');
      return newComment;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  // Load posts when user changes or component mounts
  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  return {
    posts: state.posts,
    isLoading: state.isLoading,
    error: state.error,
    loadPosts,
    loadComments,
    createPost,
    togglePostLike,
    addComment,
  };
});