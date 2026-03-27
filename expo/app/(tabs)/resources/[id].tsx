import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

import Colors from "@/constants/colors";
import { resources } from "@/mocks/resources";

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resource = resources.find((r) => r.id === id);

  if (!resource) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Resource not found</Text>
      </View>
    );
  }

  const paragraphs = resource.content.split("\n\n");

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: resource.title }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{resource.title}</Text>
          <Text style={styles.subtitle}>{resource.subtitle}</Text>
        </View>

        <View style={styles.contentCard}>
          {paragraphs.map((paragraph, index) => {
            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
            return (
              <Text key={index} style={styles.paragraph}>
                {parts.map((part, i) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <Text key={i} style={styles.bold}>
                        {part.slice(2, -2)}
                      </Text>
                    );
                  }
                  return part;
                })}
              </Text>
            );
          })}
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
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
    }),
  },
  paragraph: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  bold: {
    fontWeight: "700" as const,
    color: Colors.primary,
  },
});
