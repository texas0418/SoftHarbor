import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Bookmark, Heart, BookOpen, Quote, Trash2 } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

export default function FavoritesScreen() {
  const { favorites, removeFavorite } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRemove = (sourceId: string, type: 'quote' | 'resource' | 'story') => {
    Alert.alert('Remove from favorites?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFavorite(sourceId, type),
      },
    ]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return Quote;
      case 'resource':
        return BookOpen;
      case 'story':
        return Heart;
      default:
        return Bookmark;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote':
        return Colors.accent;
      case 'resource':
        return Colors.primaryLight;
      case 'story':
        return Colors.warmRose;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Saved', headerBackTitle: 'Home' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.heading}>Your Favorites</Text>
          <Text style={styles.subheading}>
            Quotes, articles, and stories you've saved for later.
          </Text>

          {favorites.length > 0 ? (
            <View style={styles.list}>
              {favorites.map((fav) => {
                const Icon = getTypeIcon(fav.type);
                const color = getTypeColor(fav.type);
                return (
                  <View key={fav.id} style={styles.card}>
                    <View style={[styles.iconBadge, { backgroundColor: color + '15' }]}>
                      <Icon size={18} color={color} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardType}>{fav.type.toUpperCase()}</Text>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {fav.title}
                      </Text>
                      <Text style={styles.cardPreview} numberOfLines={2}>
                        {fav.preview}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => handleRemove(fav.sourceId, fav.type)}
                      hitSlop={8}
                    >
                      <Trash2 size={16} color={Colors.error} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Bookmark size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No saved items yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the bookmark icon on quotes, resources, or stories to save them here.
              </Text>
            </View>
          )}
        </Animated.View>
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
    padding: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center' as const,
    ...Platform.select({
      ios: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
    }),
  },
  iconBadge: {
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
    color: Colors.textLight,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  cardPreview: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  removeBtn: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
