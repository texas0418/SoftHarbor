import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Plus,
  BookOpen,
  Users,
  Heart,
  ChevronRight,
  Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useJournal } from "@/providers/JournalProvider";
import { MOOD_CONFIG } from "@/types/journal";

export default function JournalScreen() {
  const router = useRouter();
  const { entries, sharedStories, deleteEntry } = useJournal();
  const [activeView, setActiveView] = useState<"journal" | "community">(
    "journal"
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, []);

  const handleDelete = useCallback(
    (id: string, title: string) => {
      Alert.alert("Delete Entry", `Delete "${title}"? This cannot be undone.`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteEntry(id);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            }
          },
        },
      ]);
    },
    [deleteEntry]
  );

  const communityPreview = sharedStories.filter((s) => !s.isOwn).slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Pressable
          style={[
            styles.toggleBtn,
            activeView === "journal" && styles.toggleActive,
          ]}
          onPress={() => setActiveView("journal")}
          testID="journal-toggle-mine"
        >
          <BookOpen
            size={15}
            color={
              activeView === "journal" ? Colors.textOnPrimary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              activeView === "journal" && styles.toggleTextActive,
            ]}
          >
            My Journal
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleBtn,
            activeView === "community" && styles.toggleActive,
          ]}
          onPress={() => setActiveView("community")}
          testID="journal-toggle-community"
        >
          <Users
            size={15}
            color={
              activeView === "community"
                ? Colors.textOnPrimary
                : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              activeView === "community" && styles.toggleTextActive,
            ]}
          >
            Community
          </Text>
        </Pressable>
      </View>

      {activeView === "journal" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.createCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push("/journal/create" as never)}
              testID="journal-create-btn"
            >
              <View style={styles.createIconWrap}>
                <Plus size={24} color={Colors.white} />
              </View>
              <View style={styles.createText}>
                <Text style={styles.createTitle}>Write a new entry</Text>
                <Text style={styles.createSub}>
                  Express what you're feeling today
                </Text>
              </View>
            </Pressable>

            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen size={48} color={Colors.border} />
                <Text style={styles.emptyTitle}>Your journal is empty</Text>
                <Text style={styles.emptySubtitle}>
                  Writing can be a powerful way to process grief. Start with
                  whatever comes to mind — there are no rules here.
                </Text>
              </View>
            ) : (
              <View style={styles.entriesList}>
                <Text style={styles.sectionLabel}>
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </Text>
                {entries.map((entry) => {
                  const moodInfo = MOOD_CONFIG[entry.mood];
                  return (
                    <Pressable
                      key={entry.id}
                      style={({ pressed }) => [
                        styles.entryCard,
                        pressed && styles.cardPressed,
                      ]}
                      onPress={() =>
                        router.push(`/journal/${entry.id}` as never)
                      }
                      testID={`journal-entry-${entry.id}`}
                    >
                      <View style={styles.entryHeader}>
                        <View
                          style={[
                            styles.moodDot,
                            { backgroundColor: moodInfo.color },
                          ]}
                        >
                          <Text style={styles.moodEmoji}>{moodInfo.emoji}</Text>
                        </View>
                        <View style={styles.entryMeta}>
                          <Text style={styles.entryDate}>
                            {formatDate(entry.createdAt)}
                          </Text>
                          {entry.isShared && (
                            <View style={styles.sharedBadge}>
                              <Users size={10} color={Colors.primaryLight} />
                              <Text style={styles.sharedText}>Shared</Text>
                            </View>
                          )}
                        </View>
                        <Pressable
                          onPress={() => handleDelete(entry.id, entry.title)}
                          hitSlop={12}
                          style={styles.deleteBtn}
                        >
                          <Trash2 size={16} color={Colors.textLight} />
                        </Pressable>
                      </View>
                      <Text style={styles.entryTitle} numberOfLines={1}>
                        {entry.title}
                      </Text>
                      <Text style={styles.entryPreview} numberOfLines={2}>
                        {entry.content}
                      </Text>
                      <View style={styles.entryFooter}>
                        <Text style={styles.moodLabel}>
                          {moodInfo.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <View style={styles.communityHeader}>
              <Text style={styles.communityIntro}>
                Stories shared by people walking the same path. You're not alone.
              </Text>
            </View>

            {sharedStories.map((story) => {
              const moodInfo = MOOD_CONFIG[story.mood];
              return (
                <Pressable
                  key={story.id}
                  style={({ pressed }) => [
                    styles.communityCard,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() =>
                    router.push(
                      `/journal/shared-story?id=${story.id}` as never
                    )
                  }
                  testID={`community-story-${story.id}`}
                >
                  <View style={styles.communityCardTop}>
                    <View style={styles.communityAuthorRow}>
                      <View
                        style={[
                          styles.authorAvatar,
                          { backgroundColor: moodInfo.color + "25" },
                        ]}
                      >
                        <Text style={styles.authorInitial}>
                          {story.authorAlias.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.authorName}>
                          {story.authorAlias}
                          {story.isOwn ? " (You)" : ""}
                        </Text>
                        <Text style={styles.communityDate}>
                          {formatDate(story.sharedAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.heartCount}>
                      <Heart
                        size={14}
                        color={Colors.warmRose}
                        fill={Colors.warmRose}
                      />
                      <Text style={styles.heartText}>{story.hearts}</Text>
                    </View>
                  </View>
                  <Text style={styles.communityTitle} numberOfLines={1}>
                    {story.title}
                  </Text>
                  <Text style={styles.communityPreview} numberOfLines={3}>
                    {story.preview}
                  </Text>
                </Pressable>
              );
            })}

            {sharedStories.length === 0 && (
              <View style={styles.emptyState}>
                <Users size={48} color={Colors.border} />
                <Text style={styles.emptyTitle}>No stories yet</Text>
                <Text style={styles.emptySubtitle}>
                  Be the first to share your journey. Your story could help
                  someone else.
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  toggleRow: {
    flexDirection: "row" as const,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.textOnPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  createCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary + "20",
    borderStyle: "dashed" as const,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  createIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  createText: {
    flex: 1,
    marginLeft: 16,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  createSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 8,
    lineHeight: 22,
  },
  entriesList: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textLight,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  entryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
    }),
  },
  entryHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 10,
  },
  moodDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  moodEmoji: {
    fontSize: 16,
  },
  entryMeta: {
    flex: 1,
    marginLeft: 10,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textLight,
  },
  sharedBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
    backgroundColor: Colors.primaryLight + "12",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sharedText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.primaryLight,
  },
  deleteBtn: {
    padding: 4,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  entryPreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  entryFooter: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textLight,
  },
  communityHeader: {
    marginBottom: 16,
  },
  communityIntro: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontStyle: "italic" as const,
  },
  communityCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
    }),
  },
  communityCardTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  communityAuthorRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  authorInitial: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  communityDate: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  heartCount: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  heartText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.warmRose,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  communityPreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
