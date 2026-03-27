import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Clock, Sparkles, UserCircle } from "lucide-react-native";

import Colors from "@/constants/colors";
import { stories } from "@/mocks/stories";

export default function StoriesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "uplifting" | "personal">(
    "all"
  );

  const filteredStories =
    activeTab === "all"
      ? stories
      : stories.filter((s) => s.type === activeTab);

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {(
          [
            { key: "all", label: "All Stories", icon: null },
            { key: "uplifting", label: "Uplifting", icon: Sparkles },
            { key: "personal", label: "Personal", icon: UserCircle },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
            testID={`stories-tab-${tab.key}`}
          >
            {tab.icon && (
              <tab.icon
                size={14}
                color={
                  activeTab === tab.key
                    ? Colors.textOnPrimary
                    : Colors.textSecondary
                }
              />
            )}
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredStories.map((story) => (
          <Pressable
            key={story.id}
            style={({ pressed }) => [
              styles.storyCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(`/stories/${story.id}` as never)}
            testID={`story-${story.id}`}
          >
            <Image
              source={{ uri: story.imageUrl }}
              style={styles.storyImage}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.storyContent}>
              <View style={styles.storyMeta}>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        story.type === "uplifting"
                          ? Colors.primaryLight + "15"
                          : Colors.warmRose + "15",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      {
                        color:
                          story.type === "uplifting"
                            ? Colors.primaryLight
                            : Colors.warmRose,
                      },
                    ]}
                  >
                    {story.type === "uplifting" ? "Uplifting" : "Personal"}
                  </Text>
                </View>
                <View style={styles.readTime}>
                  <Clock size={11} color={Colors.textLight} />
                  <Text style={styles.readTimeText}>{story.readTime}</Text>
                </View>
              </View>
              <Text style={styles.storyTitle} numberOfLines={2}>
                {story.title}
              </Text>
              <Text style={styles.storyPreview} numberOfLines={2}>
                {story.preview}
              </Text>
              <Text style={styles.storyAuthor}>{story.author}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  tabRow: {
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textOnPrimary,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
    gap: 16,
  },
  storyCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: "hidden" as const,
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
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  storyImage: {
    width: "100%",
    height: 160,
  },
  storyContent: {
    padding: 18,
  },
  storyMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  readTime: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: "500" as const,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  storyPreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  storyAuthor: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
});
