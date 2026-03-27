import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Heart,
  MessageCircle,
  Feather,
  NotebookPen,
  SmilePlus,
  Wind,
  CalendarHeart,
  Bookmark,
  ShieldAlert,
  Users,
  Moon,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { getDailyQuote } from "@/mocks/quotes";
import { useApp } from "@/providers/AppProvider";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const quote = getDailyQuote();
  const { todayCheckIn } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(
    Array.from({ length: 11 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(
        80,
        cardAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, []);

  const quickActions = [
    {
      title: "Check-in",
      subtitle: todayCheckIn ? `Today: ${todayCheckIn.emoji}` : "How are you?",
      icon: SmilePlus,
      color: "#6BAF7B",
      route: "/check-in" as const,
    },
    {
      title: "Breathe",
      subtitle: "Calm & ground",
      icon: Wind,
      color: "#8B7EC8",
      route: "/breathing" as const,
    },
    {
      title: "Get Help",
      subtitle: "Crisis resources",
      icon: ShieldAlert,
      color: "#D4736E",
      route: "/emergency" as const,
    },
  ];

  const mainCards = [
    {
      title: "Resources",
      subtitle: "Understanding & coping",
      icon: BookOpen,
      color: Colors.primaryLight,
      route: "/resources" as const,
    },
    {
      title: "Stories",
      subtitle: "You are not alone",
      icon: Heart,
      color: Colors.warmRose,
      route: "/stories" as const,
    },
    {
      title: "Journal",
      subtitle: "Write & share your story",
      icon: NotebookPen,
      color: Colors.primaryLight,
      route: "/journal" as const,
    },
    {
      title: "Companion",
      subtitle: "Someone to listen",
      icon: MessageCircle,
      color: Colors.accent,
      route: "/companion" as const,
    },
  ];

  const moreCards = [
    {
      title: "Milestones",
      subtitle: "Important dates & reminders",
      icon: CalendarHeart,
      color: "#D4A574",
      route: "/milestones" as const,
    },
    {
      title: "Saved",
      subtitle: "Your bookmarked content",
      icon: Bookmark,
      color: "#6B8FA3",
      route: "/favorites" as const,
    },
    {
      title: "Community",
      subtitle: "Anonymous encouragement",
      icon: Users,
      color: "#C4897B",
      route: "/stories/community" as const,
    },
    {
      title: "Quiet Hours",
      subtitle: "Gentle nighttime content",
      icon: Moon,
      color: "#8B7EC8",
      route: "/night-content" as const,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Late night?";
  };

  const getSubGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) return "Be gentle with yourself tonight.";
    return "Take a breath. You belong here.";
  };

  let animIndex = 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight, Colors.cream]}
        locations={[0, 0.4, 1]}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>{getSubGreeting()}</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.quoteCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.quoteIconRow}>
              <Feather size={18} color={Colors.accent} />
              <Text style={styles.quoteLabel}>Today's reflection</Text>
            </View>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </Animated.View>

          <View style={styles.quickSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickRow}>
              {quickActions.map((action) => {
                const Icon = action.icon;
                const idx = animIndex++;
                return (
                  <Animated.View
                    key={action.title}
                    style={[
                      styles.quickCardWrapper,
                      {
                        opacity: cardAnims[idx],
                        transform: [
                          {
                            translateY: cardAnims[idx].interpolate({
                              inputRange: [0, 1],
                              outputRange: [30, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.quickCard,
                        pressed && styles.cardPressed,
                      ]}
                      onPress={() => router.push(action.route as never)}
                      testID={`quick-${action.title.toLowerCase()}`}
                    >
                      <View
                        style={[
                          styles.quickIcon,
                          { backgroundColor: action.color + "15" },
                        ]}
                      >
                        <Icon size={20} color={action.color} />
                      </View>
                      <Text style={styles.quickTitle}>{action.title}</Text>
                      <Text style={styles.quickSubtitle} numberOfLines={1}>
                        {action.subtitle}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          <View style={styles.cardsSection}>
            <Text style={styles.sectionTitle}>How can we help today?</Text>
            {mainCards.map((card) => {
              const Icon = card.icon;
              const idx = animIndex++;
              return (
                <Animated.View
                  key={card.title}
                  style={{
                    opacity: cardAnims[idx],
                    transform: [
                      {
                        translateY: cardAnims[idx].interpolate({
                          inputRange: [0, 1],
                          outputRange: [40, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.card,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => router.push(card.route as never)}
                    testID={`home-card-${card.title.toLowerCase()}`}
                  >
                    <View
                      style={[
                        styles.cardIcon,
                        { backgroundColor: card.color + "18" },
                      ]}
                    >
                      <Icon size={22} color={card.color} />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                    </View>
                    <View style={styles.cardArrow}>
                      <Text style={styles.cardArrowText}>›</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.cardsSection}>
            <Text style={styles.sectionTitle}>More for you</Text>
            <View style={styles.moreGrid}>
              {moreCards.map((card) => {
                const Icon = card.icon;
                const idx = animIndex++;
                return (
                  <Animated.View
                    key={card.title}
                    style={[
                      styles.moreCardWrapper,
                      {
                        opacity: cardAnims[Math.min(idx, cardAnims.length - 1)],
                        transform: [
                          {
                            translateY: cardAnims[
                              Math.min(idx, cardAnims.length - 1)
                            ].interpolate({
                              inputRange: [0, 1],
                              outputRange: [30, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.moreCard,
                        pressed && styles.cardPressed,
                      ]}
                      onPress={() => router.push(card.route as never)}
                      testID={`more-${card.title.toLowerCase()}`}
                    >
                      <View
                        style={[
                          styles.moreIcon,
                          { backgroundColor: card.color + "15" },
                        ]}
                      >
                        <Icon size={22} color={card.color} />
                      </View>
                      <Text style={styles.moreTitle}>{card.title}</Text>
                      <Text style={styles.moreSubtitle} numberOfLines={2}>
                        {card.subtitle}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          <View style={styles.gentleReminder}>
            <Text style={styles.reminderText}>
              Grief is not a problem to be solved.{"\n"}It is a journey to be
              walked.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 28,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.textOnPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.accentLight,
    marginTop: 6,
    fontWeight: "400" as const,
  },
  quoteCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
    }),
  },
  quoteIconRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 14,
    gap: 8,
  },
  quoteLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  quoteText: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: Colors.text,
    lineHeight: 28,
    fontStyle: "italic" as const,
  },
  quoteAuthor: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    fontWeight: "500" as const,
  },
  quickSection: {
    marginBottom: 28,
  },
  quickRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  quickCardWrapper: {
    flex: 1,
  },
  quickCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
    }),
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  quickSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  cardsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
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
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cardText: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cream,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cardArrowText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
    marginTop: -2,
  },
  moreGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  moreCardWrapper: {
    width: "47%" as const,
  },
  moreCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: "center" as const,
    minHeight: 130,
    justifyContent: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
    }),
  },
  moreIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 10,
  },
  moreTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center" as const,
  },
  moreSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 16,
  },
  gentleReminder: {
    alignItems: "center" as const,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  reminderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    fontStyle: "italic" as const,
  },
});
