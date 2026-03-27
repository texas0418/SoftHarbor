import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useJournal } from "@/providers/JournalProvider";
import { MOOD_CONFIG, JournalEntry } from "@/types/journal";

type Mood = JournalEntry["mood"];
const MOODS: Mood[] = ["heavy", "sad", "neutral", "hopeful", "grateful"];

export default function CreateJournalEntry() {
  const router = useRouter();
  const { addEntry } = useJournal();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [mood, setMood] = useState<Mood>("neutral");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please give your entry a title.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Missing Content", "Write something — even a few words.");
      return;
    }

    addEntry({ title: title.trim(), content: content.trim(), mood });

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const prompts = [
    "What's weighing on your heart today?",
    "Describe a memory that brought you comfort recently.",
    "What would you say to them if you could?",
    "Write about something small that made you feel okay today.",
    "What's one thing you wish people understood about your grief?",
  ];

  const [currentPrompt] = useState(
    () => prompts[Math.floor(Math.random() * prompts.length)]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>Writing prompt</Text>
          <Text style={styles.promptText}>{currentPrompt}</Text>
        </View>

        <Text style={styles.label}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => {
            const info = MOOD_CONFIG[m];
            const isSelected = mood === m;
            return (
              <Pressable
                key={m}
                style={[
                  styles.moodChip,
                  isSelected && { backgroundColor: info.color + "20", borderColor: info.color },
                ]}
                onPress={() => {
                  setMood(m);
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                }}
                testID={`mood-${m}`}
              >
                <Text style={styles.moodChipEmoji}>{info.emoji}</Text>
                <Text
                  style={[
                    styles.moodChipText,
                    isSelected && { color: info.color, fontWeight: "700" as const },
                  ]}
                >
                  {info.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="Give this entry a title..."
          placeholderTextColor={Colors.textLight}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          testID="journal-title-input"
        />

        <Text style={styles.label}>Your thoughts</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Write freely... there's no wrong way to do this."
          placeholderTextColor={Colors.textLight}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          testID="journal-content-input"
        />

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => router.back()}
            testID="journal-cancel-btn"
          >
            <X size={18} color={Colors.textSecondary} />
            <Text style={styles.cancelText}>Discard</Text>
          </Pressable>

          <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleSave}
              testID="journal-save-btn"
            >
              <Check size={18} color={Colors.white} />
              <Text style={styles.saveText}>Save Entry</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  promptCard: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.accent,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  promptText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: "italic" as const,
  },
  label: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  moodRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 24,
  },
  moodChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  moodChipEmoji: {
    fontSize: 16,
  },
  moodChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  titleInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contentInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    minHeight: 200,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actions: {
    flexDirection: "row" as const,
    gap: 12,
  },
  cancelBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
