import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Share2,
  Edit3,
  Check,
  X,
  Heart,
  EyeOff,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useJournal } from "@/providers/JournalProvider";
import { MOOD_CONFIG, JournalEntry } from "@/types/journal";

type Mood = JournalEntry["mood"];
const MOODS: Mood[] = ["heavy", "sad", "neutral", "hopeful", "grateful"];

export default function JournalEntryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { entries, updateEntry, shareEntry, unshareEntry, userAlias, updateAlias } =
    useJournal();

  const entry = entries.find((e) => e.id === id);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(entry?.title ?? "");
  const [editContent, setEditContent] = useState<string>(entry?.content ?? "");
  const [editMood, setEditMood] = useState<Mood>(entry?.mood ?? "neutral");
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [aliasInput, setAliasInput] = useState<string>(userAlias);

  if (!entry) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Not Found" }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Entry not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.goBackText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const moodInfo = MOOD_CONFIG[entry.mood];

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      Alert.alert("Missing info", "Title and content are required.");
      return;
    }
    updateEntry(entry.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      mood: editMood,
    });
    setIsEditing(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleShare = () => {
    if (entry.isShared) {
      Alert.alert("Unshare Story", "Remove this from the community?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unshare",
          style: "destructive",
          onPress: () => {
            unshareEntry(entry.id);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            }
          },
        },
      ]);
    } else {
      setShowShareDialog(true);
    }
  };

  const confirmShare = () => {
    if (aliasInput.trim()) {
      updateAlias(aliasInput.trim());
    }
    shareEntry(entry.id);
    setShowShareDialog(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(
      "Shared",
      "Your story is now visible in the community. Thank you for your courage."
    );
  };

  const formattedDate = new Date(entry.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(entry.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => (
            <View style={styles.headerActions}>
              {!isEditing && (
                <>
                  <Pressable
                    onPress={() => {
                      setEditTitle(entry.title);
                      setEditContent(entry.content);
                      setEditMood(entry.mood);
                      setIsEditing(true);
                    }}
                    hitSlop={8}
                    style={styles.headerBtn}
                  >
                    <Edit3 size={20} color={Colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={handleShare}
                    hitSlop={8}
                    style={styles.headerBtn}
                  >
                    {entry.isShared ? (
                      <EyeOff size={20} color={Colors.warmRose} />
                    ) : (
                      <Share2 size={20} color={Colors.primary} />
                    )}
                  </Pressable>
                </>
              )}
            </View>
          ),
        }}
      />

      {showShareDialog && (
        <View style={styles.shareOverlay}>
          <View style={styles.shareDialog}>
            <Heart
              size={32}
              color={Colors.warmRose}
              fill={Colors.warmRose}
            />
            <Text style={styles.shareDialogTitle}>Share Your Story</Text>
            <Text style={styles.shareDialogSubtitle}>
              Your story will be shared anonymously with the community. Choose a
              name others will see.
            </Text>
            <TextInput
              style={styles.aliasInput}
              placeholder="Your anonymous name..."
              placeholderTextColor={Colors.textLight}
              value={aliasInput}
              onChangeText={setAliasInput}
              maxLength={20}
            />
            <View style={styles.shareActions}>
              <Pressable
                style={styles.shareCancelBtn}
                onPress={() => setShowShareDialog(false)}
              >
                <Text style={styles.shareCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.shareConfirmBtn} onPress={confirmShare}>
                <Share2 size={16} color={Colors.white} />
                <Text style={styles.shareConfirmText}>Share</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isEditing ? (
          <>
            <View style={styles.editMoodRow}>
              {MOODS.map((m) => {
                const info = MOOD_CONFIG[m];
                const isSelected = editMood === m;
                return (
                  <Pressable
                    key={m}
                    style={[
                      styles.editMoodChip,
                      isSelected && {
                        backgroundColor: info.color + "20",
                        borderColor: info.color,
                      },
                    ]}
                    onPress={() => setEditMood(m)}
                  >
                    <Text style={styles.editMoodEmoji}>{info.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={styles.editTitleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Title"
              placeholderTextColor={Colors.textLight}
            />
            <TextInput
              style={styles.editContentInput}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Content"
              placeholderTextColor={Colors.textLight}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.editActions}>
              <Pressable
                style={styles.editCancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <X size={18} color={Colors.textSecondary} />
                <Text style={styles.editCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.editSaveBtn} onPress={handleSaveEdit}>
                <Check size={18} color={Colors.white} />
                <Text style={styles.editSaveText}>Save</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.dateRow}>
              <View
                style={[
                  styles.moodBadge,
                  { backgroundColor: moodInfo.color + "18" },
                ]}
              >
                <Text style={styles.moodBadgeEmoji}>{moodInfo.emoji}</Text>
                <Text
                  style={[styles.moodBadgeText, { color: moodInfo.color }]}
                >
                  {moodInfo.label}
                </Text>
              </View>
              {entry.isShared && (
                <View style={styles.sharedIndicator}>
                  <Share2 size={12} color={Colors.primaryLight} />
                  <Text style={styles.sharedIndicatorText}>
                    Shared with community
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.detailDate}>
              {formattedDate} at {formattedTime}
            </Text>

            <Text style={styles.detailTitle}>{entry.title}</Text>

            <View style={styles.contentCard}>
              <Text style={styles.detailContent}>{entry.content}</Text>
            </View>
          </>
        )}
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
    padding: 20,
    paddingBottom: 40,
  },
  headerActions: {
    flexDirection: "row" as const,
    gap: 16,
  },
  headerBtn: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  goBackText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600" as const,
    marginTop: 12,
  },
  dateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap" as const,
  },
  moodBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  moodBadgeEmoji: {
    fontSize: 16,
  },
  moodBadgeText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  sharedIndicator: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight + "10",
  },
  sharedIndicatorText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primaryLight,
  },
  detailDate: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
    marginTop: 4,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 24,
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
  detailContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 28,
  },
  editMoodRow: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 20,
  },
  editMoodChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  editMoodEmoji: {
    fontSize: 20,
  },
  editTitleInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editContentInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    minHeight: 250,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editActions: {
    flexDirection: "row" as const,
    gap: 12,
  },
  editCancelBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editCancelText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  editSaveBtn: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  editSaveText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  shareOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 24,
  },
  shareDialog: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 380,
    alignItems: "center" as const,
  },
  shareDialogTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 12,
  },
  shareDialogSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 8,
    lineHeight: 20,
  },
  aliasInput: {
    backgroundColor: Colors.cream,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    width: "100%",
    marginTop: 20,
    textAlign: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 20,
    width: "100%",
  },
  shareCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center" as const,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareCancelText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  shareConfirmBtn: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  shareConfirmText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
