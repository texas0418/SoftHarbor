import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Check, TrendingUp } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { MOOD_LEVELS } from '@/types/app';

export default function CheckInScreen() {
  const { addCheckIn, todayCheckIn, recentCheckIns } = useApp();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const scaleAnims = useRef(MOOD_LEVELS.map(() => new Animated.Value(1))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMoodSelect = (value: number, index: number) => {
    setSelectedMood(value);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: 1.2,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = () => {
    if (selectedMood === null) return;
    const mood = MOOD_LEVELS.find((m) => m.value === selectedMood);
    if (!mood) return;
    addCheckIn(mood.value, mood.emoji, mood.label, note || undefined);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setJustCheckedIn(true);
    Animated.spring(successAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const alreadyCheckedIn = todayCheckIn && !justCheckedIn;

  const getLast7Days = () => {
    const days: { date: string; checkIn?: typeof recentCheckIns[0] }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const checkIn = recentCheckIns.find((c) => new Date(c.date).toDateString() === dateStr);
      days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        checkIn,
      });
    }
    return days;
  };

  const last7 = getLast7Days();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Daily Check-in', headerBackTitle: 'Home' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {justCheckedIn ? (
            <Animated.View
              style={[
                styles.successCard,
                {
                  opacity: successAnim,
                  transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
                },
              ]}
            >
              <View style={styles.successIcon}>
                <Check size={32} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>Check-in recorded</Text>
              <Text style={styles.successSubtitle}>
                Thank you for checking in with yourself today
              </Text>
            </Animated.View>
          ) : alreadyCheckedIn ? (
            <View style={styles.alreadyCard}>
              <Text style={styles.alreadyEmoji}>{todayCheckIn.emoji}</Text>
              <Text style={styles.alreadyTitle}>You checked in today</Text>
              <Text style={styles.alreadyLabel}>
                Feeling: {todayCheckIn.label}
              </Text>
              {todayCheckIn.note ? (
                <Text style={styles.alreadyNote}>"{todayCheckIn.note}"</Text>
              ) : null}
            </View>
          ) : (
            <>
              <Text style={styles.heading}>How are you feeling today?</Text>
              <Text style={styles.subheading}>
                There are no wrong answers. Just be honest with yourself.
              </Text>

              <View style={styles.moodRow}>
                {MOOD_LEVELS.map((mood, index) => (
                  <Animated.View
                    key={mood.value}
                    style={{ transform: [{ scale: scaleAnims[index] }] }}
                  >
                    <Pressable
                      style={[
                        styles.moodButton,
                        selectedMood === mood.value && {
                          backgroundColor: mood.color + '20',
                          borderColor: mood.color,
                        },
                      ]}
                      onPress={() => handleMoodSelect(mood.value, index)}
                      testID={`mood-${mood.value}`}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text
                        style={[
                          styles.moodLabel,
                          selectedMood === mood.value && { color: mood.color, fontWeight: '700' as const },
                        ]}
                      >
                        {mood.label}
                      </Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>

              <View style={styles.noteSection}>
                <Text style={styles.noteLabel}>Add a note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="What's on your mind?"
                  placeholderTextColor={Colors.textLight}
                  multiline
                  value={note}
                  onChangeText={setNote}
                  maxLength={200}
                  testID="check-in-note"
                />
              </View>

              <Pressable
                style={[styles.submitButton, selectedMood === null && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={selectedMood === null}
                testID="check-in-submit"
              >
                <Text style={styles.submitText}>Record check-in</Text>
              </Pressable>
            </>
          )}

          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <TrendingUp size={18} color={Colors.primary} />
              <Text style={styles.historyTitle}>Last 7 days</Text>
            </View>
            <View style={styles.weekRow}>
              {last7.map((day, i) => (
                <View key={i} style={styles.dayColumn}>
                  <View
                    style={[
                      styles.dayDot,
                      day.checkIn
                        ? { backgroundColor: MOOD_LEVELS.find((m) => m.value === day.checkIn!.mood)?.color || Colors.textLight }
                        : styles.dayDotEmpty,
                    ]}
                  >
                    {day.checkIn ? (
                      <Text style={styles.dayEmoji}>{day.checkIn.emoji}</Text>
                    ) : (
                      <Text style={styles.dayDash}>—</Text>
                    )}
                  </View>
                  <Text style={styles.dayLabel}>{day.date}</Text>
                </View>
              ))}
            </View>
          </View>

          {recentCheckIns.length > 0 && (
            <View style={styles.streakSection}>
              <Text style={styles.streakTitle}>
                {recentCheckIns.length} check-in{recentCheckIns.length !== 1 ? 's' : ''} total
              </Text>
              <Text style={styles.streakSubtitle}>
                Keep showing up for yourself
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
    marginBottom: 32,
  },
  moodRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 28,
    gap: 6,
  },
  moodButton: {
    alignItems: 'center' as const,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 62,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  noteSection: {
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  noteInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center' as const,
    marginBottom: 32,
    ...Platform.select({
      ios: { shadowColor: Colors.success, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 4 },
      web: { shadowColor: Colors.success, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
    }),
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success + '15',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  alreadyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center' as const,
    marginBottom: 32,
    ...Platform.select({
      ios: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 3 },
      web: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
    }),
  },
  alreadyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  alreadyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  alreadyLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  alreadyNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    marginTop: 10,
    textAlign: 'center' as const,
  },
  historySection: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
    }),
  },
  historyHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  weekRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  dayColumn: {
    alignItems: 'center' as const,
    gap: 6,
  },
  dayDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dayDotEmpty: {
    backgroundColor: Colors.creamDark,
  },
  dayEmoji: {
    fontSize: 18,
  },
  dayDash: {
    fontSize: 14,
    color: Colors.textLight,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  streakSection: {
    alignItems: 'center' as const,
    paddingVertical: 16,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  streakSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
