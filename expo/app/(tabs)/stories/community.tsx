import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, Send, Users } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

const EMOJI_OPTIONS = ['🤍', '🕊️', '🌻', '🌱', '💪', '🌙', '⭐', '🦋', '☀️', '🌷'];

export default function CommunityWallScreen() {
  const { communityPosts, addCommunityPost, heartCommunityPost } = useApp();
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🤍');
  const [showComposer, setShowComposer] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const composerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleComposer = () => {
    if (showComposer) {
      Animated.timing(composerAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowComposer(false));
    } else {
      setShowComposer(true);
      Animated.timing(composerAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  };

  const handleSubmit = () => {
    if (!message.trim()) return;
    addCommunityPost(message.trim(), selectedEmoji);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setMessage('');
    setSelectedEmoji('🤍');
    toggleComposer();
  };

  const handleHeart = (postId: string) => {
    heartCommunityPost(postId);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const sortedPosts = [...communityPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Community Wall', headerBackTitle: 'Stories' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.headerRow}>
              <Users size={20} color={Colors.primary} />
              <Text style={styles.heading}>Community Wall</Text>
            </View>
            <Text style={styles.subheading}>
              A safe space to share words of encouragement, solidarity, and hope. All posts are anonymous.
            </Text>

            <Pressable style={styles.composeButton} onPress={toggleComposer} testID="compose-post">
              <Text style={styles.composeButtonText}>
                {showComposer ? 'Cancel' : 'Share encouragement'}
              </Text>
            </Pressable>

            {showComposer && (
              <Animated.View
                style={[
                  styles.composerCard,
                  {
                    opacity: composerAnim,
                    transform: [{ translateY: composerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
                  },
                ]}
              >
                <TextInput
                  style={styles.composerInput}
                  placeholder="Write something kind..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  value={message}
                  onChangeText={setMessage}
                  maxLength={280}
                  testID="community-input"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiBtnActive]}
                      onPress={() => setSelectedEmoji(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable
                  style={[styles.sendButton, !message.trim() && styles.sendDisabled]}
                  onPress={handleSubmit}
                  disabled={!message.trim()}
                  testID="send-post"
                >
                  <Send size={16} color={Colors.textOnPrimary} />
                  <Text style={styles.sendText}>Post anonymously</Text>
                </Pressable>
              </Animated.View>
            )}

            <View style={styles.postsSection}>
              {sortedPosts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <Text style={styles.postEmoji}>{post.emoji}</Text>
                    <Text style={styles.postTime}>{getTimeAgo(post.createdAt)}</Text>
                  </View>
                  <Text style={styles.postMessage}>{post.message}</Text>
                  <Pressable
                    style={styles.heartRow}
                    onPress={() => handleHeart(post.id)}
                    hitSlop={8}
                  >
                    <Heart
                      size={16}
                      color={Colors.warmRose}
                      fill={post.hearts > 0 ? Colors.warmRose : 'transparent'}
                    />
                    <Text style={styles.heartCount}>{post.hearts}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  composeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  composeButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  composerCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    gap: 14,
    ...Platform.select({
      ios: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 3 },
      web: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16 },
    }),
  },
  composerInput: {
    backgroundColor: Colors.cream,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiRow: {
    maxHeight: 44,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 6,
    backgroundColor: Colors.cream,
  },
  emojiBtnActive: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emojiText: {
    fontSize: 20,
  },
  sendButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: Colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  postsSection: {
    gap: 12,
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 1 },
      web: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 10 },
    }),
  },
  postHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
  },
  postEmoji: {
    fontSize: 22,
  },
  postTime: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  postMessage: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  heartRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  heartCount: {
    fontSize: 13,
    color: Colors.warmRose,
    fontWeight: '600' as const,
  },
});
