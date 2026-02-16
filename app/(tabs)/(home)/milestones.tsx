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
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Plus, Trash2, Calendar, X } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { MILESTONE_TYPES, Milestone } from '@/types/app';

export default function MilestonesScreen() {
  const { milestones, upcomingMilestones, addMilestone, deleteMilestone } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dateText, setDateText] = useState('');
  const [selectedType, setSelectedType] = useState<Milestone['type']>('memorial');
  const [note, setNote] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleForm = () => {
    if (showForm) {
      Animated.timing(formAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowForm(false));
    } else {
      setShowForm(true);
      Animated.timing(formAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !dateText.trim()) {
      Alert.alert('Missing info', 'Please enter a title and date.');
      return;
    }

    const parsed = new Date(dateText);
    if (isNaN(parsed.getTime())) {
      Alert.alert('Invalid date', 'Please enter a valid date (e.g., March 15, 2024 or 2024-03-15).');
      return;
    }

    addMilestone({
      title: title.trim(),
      date: parsed.toISOString(),
      type: selectedType,
      note: note.trim() || undefined,
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setTitle('');
    setDateText('');
    setNote('');
    setSelectedType('memorial');
    toggleForm();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove milestone?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteMilestone(id),
      },
    ]);
  };

  const getDaysUntil = (nextDate: Date) => {
    const now = new Date();
    const diff = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  const getTypeEmoji = (type: Milestone['type']) => {
    return MILESTONE_TYPES.find((t) => t.key === type)?.emoji || '📌';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Milestones', headerBackTitle: 'Home' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.heading}>Important Dates</Text>
          <Text style={styles.subheading}>
            Remember and honor the dates that matter to you. We'll be here with gentle reminders.
          </Text>

          <Pressable style={styles.addButton} onPress={toggleForm} testID="add-milestone">
            {showForm ? (
              <X size={18} color={Colors.textOnPrimary} />
            ) : (
              <Plus size={18} color={Colors.textOnPrimary} />
            )}
            <Text style={styles.addButtonText}>
              {showForm ? 'Cancel' : 'Add a date'}
            </Text>
          </Pressable>

          {showForm && (
            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: formAnim,
                  transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
                },
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Title (e.g., Mom's birthday)"
                placeholderTextColor={Colors.textLight}
                value={title}
                onChangeText={setTitle}
                testID="milestone-title"
              />
              <TextInput
                style={styles.input}
                placeholder="Date (e.g., March 15, 2024)"
                placeholderTextColor={Colors.textLight}
                value={dateText}
                onChangeText={setDateText}
                testID="milestone-date"
              />
              <View style={styles.typeRow}>
                {MILESTONE_TYPES.map((t) => (
                  <Pressable
                    key={t.key}
                    style={[styles.typeChip, selectedType === t.key && styles.typeChipActive]}
                    onPress={() => setSelectedType(t.key)}
                  >
                    <Text style={styles.typeEmoji}>{t.emoji}</Text>
                    <Text style={[styles.typeLabel, selectedType === t.key && styles.typeLabelActive]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder="Add a note (optional)"
                placeholderTextColor={Colors.textLight}
                value={note}
                onChangeText={setNote}
                multiline
              />
              <Pressable style={styles.submitButton} onPress={handleSubmit} testID="milestone-submit">
                <Text style={styles.submitText}>Save milestone</Text>
              </Pressable>
            </Animated.View>
          )}

          {upcomingMilestones.length > 0 ? (
            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcomingMilestones.map((m) => (
                <View key={m.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneLeft}>
                    <Text style={styles.milestoneEmoji}>{getTypeEmoji(m.type)}</Text>
                  </View>
                  <View style={styles.milestoneCenter}>
                    <Text style={styles.milestoneTitle}>{m.title}</Text>
                    <Text style={styles.milestoneDate}>
                      {new Date(m.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </Text>
                    {m.note ? <Text style={styles.milestoneNote}>{m.note}</Text> : null}
                  </View>
                  <View style={styles.milestoneRight}>
                    <Text style={styles.milestoneDays}>{getDaysUntil(m.nextDate)}</Text>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDelete(m.id)}
                      hitSlop={8}
                    >
                      <Trash2 size={14} color={Colors.error} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No milestones yet</Text>
              <Text style={styles.emptySubtitle}>
                Add dates that are meaningful to you
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
  addButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  addButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 3 },
      web: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16 },
    }),
  },
  input: {
    backgroundColor: Colors.cream,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteInput: {
    minHeight: 60,
    textAlignVertical: 'top' as const,
  },
  typeRow: {
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  typeChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  typeEmoji: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  typeLabelActive: {
    color: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center' as const,
  },
  submitText: {
    color: Colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  listSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  milestoneCard: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center' as const,
    ...Platform.select({
      ios: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 2 },
      web: { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10 },
    }),
  },
  milestoneLeft: {
    marginRight: 14,
  },
  milestoneEmoji: {
    fontSize: 28,
  },
  milestoneCenter: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  milestoneDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  milestoneNote: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic' as const,
    marginTop: 4,
  },
  milestoneRight: {
    alignItems: 'flex-end' as const,
    gap: 8,
  },
  milestoneDays: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  deleteButton: {
    padding: 4,
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
  },
});
