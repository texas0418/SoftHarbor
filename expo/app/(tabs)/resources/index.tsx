import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Layers,
  TrendingUp,
  CalendarDays,
  Zap,
  Heart,
  Users,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { resources, resourceCategories, Resource } from "@/mocks/resources";

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  layers: Layers,
  "trending-up": TrendingUp,
  "calendar-days": CalendarDays,
  zap: Zap,
  heart: Heart,
  users: Users,
};

export default function ResourcesScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredResources =
    activeCategory === "all"
      ? resources
      : resources.filter((r) => r.category === activeCategory);

  const getCategoryColor = useCallback((category: Resource["category"]) => {
    switch (category) {
      case "stages":
        return Colors.primaryLight;
      case "coping":
        return Colors.accent;
      case "selfcare":
        return Colors.warmRose;
      case "understanding":
        return "#6B8FA3";
      default:
        return Colors.primary;
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {resourceCategories.map((cat) => (
          <Pressable
            key={cat.key}
            style={[
              styles.filterChip,
              activeCategory === cat.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategory(cat.key)}
            testID={`filter-${cat.key}`}
          >
            <Text
              style={[
                styles.filterChipText,
                activeCategory === cat.key && styles.filterChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredResources.map((resource) => {
          const IconComponent = iconMap[resource.icon] || Heart;
          const color = getCategoryColor(resource.category);
          return (
            <Pressable
              key={resource.id}
              style={({ pressed }) => [
                styles.resourceCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(`/resources/${resource.id}` as never)}
              testID={`resource-${resource.id}`}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: color + "15" }]}
              >
                <IconComponent size={22} color={color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{resource.title}</Text>
                <Text style={styles.cardSubtitle}>{resource.subtitle}</Text>
              </View>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: color + "12" },
                ]}
              >
                <Text style={[styles.categoryBadgeText, { color }]}>
                  {resource.category}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  filterRow: {
    maxHeight: 56,
    backgroundColor: Colors.cream,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textOnPrimary,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
    gap: 12,
  },
  resourceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    textTransform: "capitalize" as const,
  },
});
