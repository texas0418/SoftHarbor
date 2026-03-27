import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Moon, Sparkles, BookOpen, Heart } from 'lucide-react-native';

import { nightContent, NightContent } from '@/mocks/night-content';

const TYPE_CONFIG: Record<NightContent['type'], { label: string; icon: React.ComponentType<{ size: number; color: string }>; color: string }> = {
  meditation: { label: 'Meditation', icon: Sparkles, color: '#8B7EC8' },
  affirmation: { label: 'Affirmation', icon: Heart, color: '#C4897B' },
  reflection: { label: 'Reflection', icon: BookOpen, color: '#6B8FA3' },
  comfort: { label: 'Comfort', icon: Moon, color: '#B8A88A' },
};

export default function NightContentScreen() {
  const [selectedContent, setSelectedContent] = useState<NightContent | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const openContent = (content: NightContent) => {
    setSelectedContent(content);
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const closeContent = () => {
    Animated.timing(contentAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedContent(null));
  };

  const filtered = activeFilter === 'all'
    ? nightContent
    : nightContent.filter((c) => c.type === activeFilter);

  const isNightTime = () => {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 6;
  };

  const bgColor = isNightTime() ? '#1A1A2E' : '#F5F0E8';
  const textColor = isNightTime() ? '#E8E2D8' : '#2C2C2C';
  const secondaryColor = isNightTime() ? '#9A9A9A' : '#6B6B6B';
  const cardBg = isNightTime() ? '#252540' : '#FFFFFF';
  const chipBg = isNightTime() ? '#2A2A45' : '#FFFFFF';
  const chipBorder = isNightTime() ? '#3A3A55' : '#E8E2D8';
  const activeBg = isNightTime() ? '#3D6B52' : '#2D4739';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen
        options={{
          title: isNightTime() ? 'Quiet Hours' : 'Gentle Content',
          headerBackTitle: 'Home',
          headerStyle: { backgroundColor: bgColor },
          headerTintColor: textColor,
        }}
      />

      {selectedContent ? (
        <Animated.View
          style={[
            styles.fullContent,
            { backgroundColor: bgColor, opacity: contentAnim },
          ]}
        >
          <ScrollView contentContainerStyle={styles.fullScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.fullHeader}>
              <View style={[styles.typeBadgeLarge, { backgroundColor: TYPE_CONFIG[selectedContent.type].color + '20' }]}>
                {React.createElement(TYPE_CONFIG[selectedContent.type].icon, {
                  size: 22,
                  color: TYPE_CONFIG[selectedContent.type].color,
                })}
              </View>
              <Text style={[styles.fullType, { color: TYPE_CONFIG[selectedContent.type].color }]}>
                {TYPE_CONFIG[selectedContent.type].label}
              </Text>
              {selectedContent.duration && (
                <Text style={[styles.fullDuration, { color: secondaryColor }]}>
                  {selectedContent.duration}
                </Text>
              )}
            </View>
            <Text style={[styles.fullTitle, { color: textColor }]}>
              {selectedContent.title}
            </Text>
            <Text style={[styles.fullBody, { color: secondaryColor }]}>
              {selectedContent.content}
            </Text>
            <Pressable style={[styles.backButton, { backgroundColor: activeBg }]} onPress={closeContent}>
              <Text style={styles.backButtonText}>Back to list</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {isNightTime() && (
              <View style={styles.nightBanner}>
                <Moon size={18} color="#8B7EC8" />
                <Text style={styles.nightBannerText}>
                  It's late. Be gentle with yourself tonight.
                </Text>
              </View>
            )}

            <Text style={[styles.heading, { color: textColor }]}>
              {isNightTime() ? 'Quiet Hours' : 'Gentle Content'}
            </Text>
            <Text style={[styles.subheading, { color: secondaryColor }]}>
              Soothing meditations, affirmations, and reflections for when you need comfort most.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              contentContainerStyle={styles.filterContent}
            >
              {['all', 'meditation', 'affirmation', 'reflection', 'comfort'].map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterChip,
                    { backgroundColor: chipBg, borderColor: chipBorder },
                    activeFilter === filter && { backgroundColor: activeBg, borderColor: activeBg },
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: secondaryColor },
                      activeFilter === filter && styles.filterTextActive,
                    ]}
                  >
                    {filter === 'all' ? 'All' : TYPE_CONFIG[filter as NightContent['type']].label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.contentList}>
              {filtered.map((item) => {
                const config = TYPE_CONFIG[item.type];
                const Icon = config.icon;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.contentCard, { backgroundColor: cardBg }]}
                    onPress={() => openContent(item)}
                  >
                    <View style={[styles.typeBadge, { backgroundColor: config.color + '18' }]}>
                      <Icon size={18} color={config.color} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardType, { color: config.color }]}>
                        {config.label}
                      </Text>
                      <Text style={[styles.cardTitle, { color: textColor }]}>
                        {item.title}
                      </Text>
                      {item.duration && (
                        <Text style={[styles.cardDuration, { color: secondaryColor }]}>
                          {item.duration}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.cardArrow, { backgroundColor: isNightTime() ? '#1A1A2E' : '#F5F0E8' }]}>
                      <Text style={[styles.cardArrowText, { color: secondaryColor }]}>›</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  nightBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: '#8B7EC815',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  nightBannerText: {
    fontSize: 14,
    color: '#8B7EC8',
    fontWeight: '500' as const,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  filterRow: {
    maxHeight: 48,
    marginBottom: 20,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  filterTextActive: {
    color: '#F5F0E8',
  },
  contentList: {
    gap: 12,
  },
  contentCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
    }),
  },
  typeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardType: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  cardDuration: {
    fontSize: 12,
    marginTop: 4,
  },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: 8,
  },
  cardArrowText: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: -2,
  },
  fullContent: {
    flex: 1,
  },
  fullScrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  fullHeader: {
    alignItems: 'center' as const,
    marginBottom: 24,
    gap: 8,
  },
  typeBadgeLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  fullType: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  fullDuration: {
    fontSize: 13,
  },
  fullTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 28,
  },
  fullBody: {
    fontSize: 17,
    lineHeight: 30,
    marginBottom: 32,
  },
  backButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  backButtonText: {
    color: '#F5F0E8',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
