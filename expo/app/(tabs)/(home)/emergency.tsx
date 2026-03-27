import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Phone, MessageSquare, ExternalLink, ShieldAlert } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { emergencyResources } from '@/mocks/emergency';

export default function EmergencyScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCall = (phone: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const url = `tel:${phone.replace(/[^0-9+]/g, '')}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Cannot make calls', `Please dial ${phone} from your phone.`);
      }
    });
  };

  const handleUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Get Help Now', headerBackTitle: 'Home' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.urgentBanner}>
            <ShieldAlert size={22} color="#D4736E" />
            <View style={styles.urgentText}>
              <Text style={styles.urgentTitle}>
                If you are in immediate danger, call 911
              </Text>
              <Text style={styles.urgentSubtitle}>
                These resources are here to help you 24/7
              </Text>
            </View>
          </View>

          <Text style={styles.heading}>Crisis Resources</Text>
          <Text style={styles.subheading}>
            You don't have to go through this alone. Professional help is available.
          </Text>

          {emergencyResources.map((resource) => (
            <View key={resource.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{resource.emoji}</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{resource.name}</Text>
                  <Text style={styles.cardAvailability}>{resource.available}</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>{resource.description}</Text>
              <View style={styles.cardActions}>
                {resource.phone && (
                  <Pressable
                    style={[styles.actionChip, styles.callChip]}
                    onPress={() => handleCall(resource.phone!)}
                  >
                    <Phone size={14} color="#fff" />
                    <Text style={styles.callChipText}>{resource.phone}</Text>
                  </Pressable>
                )}
                {resource.text && (
                  <View style={[styles.actionChip, styles.textChip]}>
                    <MessageSquare size={14} color={Colors.primary} />
                    <Text style={styles.textChipText}>Text {resource.text}</Text>
                  </View>
                )}
                {resource.url && (
                  <Pressable
                    style={[styles.actionChip, styles.linkChip]}
                    onPress={() => handleUrl(resource.url!)}
                  >
                    <ExternalLink size={14} color={Colors.accent} />
                    <Text style={styles.linkChipText}>Website</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember: Reaching out for help is a sign of strength, not weakness. You matter.
            </Text>
          </View>
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
  urgentBanner: {
    flexDirection: 'row' as const,
    backgroundColor: '#D4736E12',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center' as const,
    gap: 14,
    borderWidth: 1,
    borderColor: '#D4736E30',
  },
  urgentText: {
    flex: 1,
  },
  urgentTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#D4736E',
    marginBottom: 2,
  },
  urgentSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
    }),
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
    gap: 12,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cardAvailability: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  actionChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  callChip: {
    backgroundColor: Colors.primary,
  },
  callChipText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
  textChip: {
    backgroundColor: Colors.primary + '10',
  },
  textChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  linkChip: {
    backgroundColor: Colors.accent + '15',
  },
  linkChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  footer: {
    alignItems: 'center' as const,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    fontStyle: 'italic' as const,
  },
});
