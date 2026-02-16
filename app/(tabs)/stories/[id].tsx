import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Image } from "expo-image";
import { Clock } from "lucide-react-native";

import Colors from "@/constants/colors";
import { stories } from "@/mocks/stories";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = stories.find((s) => s.id === id);

  if (!story) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Story not found</Text>
      </View>
    );
  }

  const paragraphs = story.content.split("\n\n");

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "" }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Image
          source={{ uri: story.imageUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={400}
        />

        <View style={styles.content}>
          <View style={styles.meta}>
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
              <Clock size={12} color={Colors.textLight} />
              <Text style={styles.readTimeText}>{story.readTime} read</Text>
            </View>
          </View>

          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.author}>Shared by {story.author}</Text>

          <View style={styles.divider} />

          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
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
  errorContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.cream,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroImage: {
    width: "100%",
    height: 240,
  },
  content: {
    padding: 24,
  },
  meta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 14,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  readTime: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
  },
  readTimeText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "500" as const,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.primary,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  author: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: "600" as const,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  paragraph: {
    fontSize: 17,
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 18,
  },
});
