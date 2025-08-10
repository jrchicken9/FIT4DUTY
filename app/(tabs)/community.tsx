import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { MessageCircle, Search, Plus, Heart, X, Send } from "lucide-react-native";
import Colors from "@/constants/colors";
import FAQItem from "@/components/FAQItem";
import faqs from "@/constants/faqs";

import { useAuth } from "@/context/AuthContext";
import { useCommunity, CommunityComment } from "@/context/CommunityContext";

type FilterCategory = "All" | "Application" | "Fitness" | "Testing" | "Training" | "General";

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'faq' | 'community'>('faq');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("All");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<FilterCategory>("General");
  const [showComments, setShowComments] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { posts, isLoading: postsLoading, createPost, togglePostLike, addComment, loadComments } = useCommunity();
  const [postComments, setPostComments] = useState<Record<string, CommunityComment[]>>({});

  const categories: FilterCategory[] = [
    "All",
    "Application",
    "Fitness",
    "Testing",
    "Training",
    "General",
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Map post_type to category for filtering
    const categoryMap: Record<string, FilterCategory> = {
      'question': 'Application',
      'achievement': 'General',
      'tip': 'Fitness',
      'discussion': 'General',
    };
    
    const postCategory = categoryMap[post.post_type || 'discussion'] || 'General';
    const matchesCategory = selectedCategory === "All" || postCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }
    await createPost(newPostContent, newPostCategory);
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    const comment = await addComment(postId, newComment);
    if (comment) {
      // Add the new comment to the local state
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), {
          ...comment,
          user_name: (comment.profiles as any)?.full_name || user?.full_name || 'Anonymous',
          user_avatar: (comment.profiles as any)?.avatar_url || user?.avatar_url || undefined,
          isLiked: false,
        }]
      }));
    }
    setNewComment('');
  };

  const handleToggleComments = async (postId: string) => {
    if (showComments === postId) {
      setShowComments(null);
      return;
    }

    setShowComments(postId);
    
    // Load comments if not already loaded
    if (!postComments[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const comments = await loadComments(postId);
      setPostComments(prev => ({ ...prev, [postId]: comments }));
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community & Support</Text>
        <Text style={styles.subtitle}>
          Find answers to common questions and connect with others
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
          onPress={() => setActiveTab('faq')}
        >
          <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
            FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'community' && styles.activeTab]}
          onPress={() => setActiveTab('community')}
        >
          <Text style={[styles.tabText, activeTab === 'community' && styles.activeTabText]}>
            Community
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'faq' ? "Search FAQs..." : "Search posts..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category &&
                    styles.selectedCategoryButtonText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentList}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'faq' ? (
          <>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <Text style={styles.sectionDescription}>
              Find answers to common questions about becoming a police officer in Ontario
            </Text>
            {filteredFAQs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
            {filteredFAQs.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No FAQs found. Try adjusting your search or category filter.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.createPostContainer}>
              <TouchableOpacity
                style={styles.createPostButton}
                onPress={() => setShowCreatePost(true)}
              >
                <Plus size={20} color={Colors.primary} />
                <Text style={styles.createPostText}>Share your experience or ask a question</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Community Posts</Text>
            <Text style={styles.sectionDescription}>
              Connect with fellow aspiring officers and share your journey
            </Text>
            {filteredPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postUserInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(post.user_name || 'Anonymous').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{post.user_name || 'Anonymous'}</Text>
                      <Text style={styles.postTime}>{formatTimeAgo(post.created_at)}</Text>
                    </View>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{post.post_type || 'General'}</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => togglePostLike(post.id)}
                  >
                    <Heart
                      size={18}
                      color={post.isLiked ? Colors.red : Colors.textSecondary}
                      fill={post.isLiked ? Colors.red : 'none'}
                    />
                    <Text style={styles.actionText}>{post.likes_count}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleComments(post.id)}
                  >
                    <MessageCircle size={18} color={Colors.textSecondary} />
                    <Text style={styles.actionText}>{post.comments_count}</Text>
                  </TouchableOpacity>
                </View>
                {showComments === post.id && (
                  <View style={styles.commentsSection}>
                    {loadingComments[post.id] ? (
                      <Text style={styles.noResultsText}>Loading comments...</Text>
                    ) : (
                      (postComments[post.id] || []).map((comment) => (
                        <View key={comment.id} style={styles.comment}>
                          <View style={styles.commentHeader}>
                            <View style={styles.smallAvatar}>
                              <Text style={styles.smallAvatarText}>{(comment.user_name || 'Anonymous').charAt(0).toUpperCase()}</Text>
                            </View>
                            <Text style={styles.commentUserName}>{comment.user_name || 'Anonymous'}</Text>
                            <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
                          </View>
                          <Text style={styles.commentContent}>{comment.content}</Text>
                        </View>
                      ))
                    )}
                    <View style={styles.addCommentContainer}>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChangeText={setNewComment}
                        placeholderTextColor={Colors.textSecondary}
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => handleAddComment(post.id)}
                      >
                        <Send size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
            {postsLoading && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  Loading posts...
                </Text>
              </View>
            )}
            {!postsLoading && filteredPosts.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No posts found. Be the first to share your experience!
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={handleCreatePost}>
              <Text style={styles.postButton}>Post</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.categorySelector}>
              <Text style={styles.categorySelectorLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.filter(cat => cat !== 'All').map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.modalCategoryButton,
                      newPostCategory === category && styles.selectedModalCategory,
                    ]}
                    onPress={() => setNewPostCategory(category)}
                  >
                    <Text
                      style={[
                        styles.modalCategoryText,
                        newPostCategory === category && styles.selectedModalCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TextInput
              style={styles.postInput}
              placeholder="Share your experience, ask a question, or offer advice to fellow aspiring officers..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              textAlignVertical="top"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: Colors.white,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  categoriesContainer: {
    backgroundColor: Colors.white,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectedCategoryButtonText: {
    color: Colors.white,
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
  },
  contentList: {
    padding: 16,
  },
  createPostContainer: {
    marginBottom: 16,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createPostText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  postTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  postContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  comment: {
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  smallAvatarText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  commentTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  commentContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 18,
    marginLeft: 32,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 80,
  },
  sendButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  categorySelector: {
    marginBottom: 16,
  },
  categorySelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  modalCategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    marginRight: 8,
  },
  selectedModalCategory: {
    backgroundColor: Colors.primary,
  },
  modalCategoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectedModalCategoryText: {
    color: Colors.white,
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  noResultsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },

});