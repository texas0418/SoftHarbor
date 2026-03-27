import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Heart, ArrowLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useJournal } from "@/providers/JournalProvider";
import { MOOD_CONFIG } from "@/types/journal";

export default function SharedStoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sharedStories, heartStory } = useJournal();

  const story = sharedStories.find((s) => s.id === id);

  const handleHeart = useCallback(() => {
    if (!story) return;
    heartStory(story.id);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [story, heartStory]);

  if (!story) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Not Found" }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Story not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.goBackText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const moodInfo = MOOD_CONFIG[story.mood];
  const formattedDate = new Date(story.sharedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "" }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.authorSection}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: moodInfo.color + "20" },
            ]}
          >
            <Text style={[styles.avatarText, { color: moodInfo.color }]}>
              {story.authorAlias.charAt(0)}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {story.authorAlias}
              {story.isOwn ? " (You)" : ""}
            </Text>
            <Text style={styles.storyDate}>{formattedDate}</Text>
          </View>
          <View
            style={[
              styles.moodTag,
              { backgroundColor: moodInfo.color + "15" },
            ]}
          >
            <Text style={styles.moodTagEmoji}>{moodInfo.emoji}</Text>
            <Text style={[styles.moodTagText, { color: moodInfo.color }]}>
              {moodInfo.label}
            </Text>
          </View>
        </View>

        <Text style={styles.storyTitle}>{story.title}</Text>

        <View style={styles.contentCard}>
          <Text style={styles.storyContent}>{story.content}</Text>
        </View>

        <View style={styles.heartSection}>
          <Pressable
            style={({ pressed }) => [
              styles.heartBtn,
              pressed && styles.heartBtnPressed,
            ]}
            onPress={handleHeart}
            testID="heart-story-btn"
          >
            <Heart size={22} color={Colors.warmRose} fill={Colors.warmRose} />
            <Text style={styles.heartBtnText}>{story.hearts}</Text>
          </Pressable>
          <Text style={styles.heartHint}>
            Tap to show this story touched your heart
          </Text>
        </View>

        <View style={styles.encouragement}>
          <Text style={styles.encouragementText}>
            Every story shared is a hand reached out in the dark.{"\n"}Thank you
            for being here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  goBackText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600" as const,
    marginTop: 12,
  },
  authorSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  storyDate: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  moodTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  moodTagEmoji: {
    fontSize: 14,
  },
  moodTagText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  storyTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
    }),
  },
  storyContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 28,
  },
  heartSection: {
    alignItems: "center" as const,
    marginBottom: 32,
  },
  heartBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.warmRose + "12",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.warmRose + "30",
  },
  heartBtnPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  heartBtnText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.warmRose,
  },
  heartHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
  encouragement: {
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  encouragementText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    fontStyle: "italic" as const,
  },
});
