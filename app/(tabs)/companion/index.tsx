import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, Heart, RotateCcw } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useRorkAgent } from "@rork-ai/toolkit-sdk";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SYSTEM_CONTEXT = `[System: You are Solace, a warm, compassionate grief companion. You are here to listen, support, and comfort people who are dealing with loss and grief. Be deeply empathetic and gentle. Never minimize their feelings. Use warm, human language. Avoid clinical or robotic responses. Ask thoughtful follow-up questions to show you're truly listening. Validate their emotions. Grief is not a problem to solve — it's a journey to walk. If they share about their loved one, be curious and caring about who that person was. Gently remind them that grief looks different for everyone and there's no "right way." If they seem in crisis or mention self-harm, compassionately encourage them to reach out to a crisis helpline (988 Suicide & Crisis Lifeline in the US). Keep responses relatively concise — 2-4 paragraphs max. This is a conversation, not a lecture. Never say "I understand how you feel" — instead, say things like "That sounds incredibly painful" or "I can hear how much they meant to you." Prioritize listening over teaching.]\n\n`;

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showWelcome, setShowWelcome] = useState(true);

  const { messages, sendMessage, setMessages } = useRorkAgent({
    tools: {},
  });

  const displayMessages: DisplayMessage[] = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const textParts = m.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
      return {
        id: m.id,
        role: m.role as "user" | "assistant",
        text: textParts,
      };
    })
    .filter((m) => m.text.length > 0);

  const isLoading =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].parts.every(
      (p) => p.type !== "text" || (p.type === "text" && p.text === "")
    );

  useEffect(() => {
    if (displayMessages.length > 0 && showWelcome) {
      setShowWelcome(false);
    }
  }, [displayMessages.length, showWelcome]);

  useEffect(() => {
    if (showWelcome) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showWelcome, pulseAnim]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const messageToSend = messages.length === 0 ? SYSTEM_CONTEXT + trimmed : trimmed;
    sendMessage(messageToSend);
    setInput("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleReset = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setMessages([]);
    setShowWelcome(true);
  };

  const handleSuggestion = (text: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const messageToSend = messages.length === 0 ? SYSTEM_CONTEXT + text : text;
    sendMessage(messageToSend);
    setShowWelcome(false);
  };

  const suggestions = [
    "I lost someone close to me",
    "I'm having a really hard day",
    "I don't know how to cope",
    "I just need someone to listen",
  ];

  const renderMessage = ({ item }: { item: DisplayMessage }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageBubbleRow,
          isUser ? styles.userRow : styles.assistantRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerDot} />
            <View>
              <Text style={styles.headerTitle}>Solace</Text>
              <Text style={styles.headerSubtitle}>Your grief companion</Text>
            </View>
          </View>
          {displayMessages.length > 0 && (
            <Pressable
              onPress={handleReset}
              style={styles.resetButton}
              testID="reset-chat"
            >
              <RotateCcw size={18} color={Colors.accentLight} />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {showWelcome ? (
          <View style={styles.welcomeContainer}>
            <Animated.View
              style={[
                styles.welcomeIconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Heart size={36} color={Colors.warmRose} fill={Colors.warmRose} />
            </Animated.View>
            <Text style={styles.welcomeTitle}>You're not alone</Text>
            <Text style={styles.welcomeText}>
              I'm here to listen whenever you need someone. There's no right or
              wrong thing to say. Take your time.
            </Text>
            <View style={styles.suggestionsContainer}>
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    pressed && styles.suggestionPressed,
                  ]}
                  onPress={() => handleSuggestion(suggestion)}
                  testID={`suggestion-${suggestion.slice(0, 10)}`}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={
              isLoading ? (
                <View style={[styles.messageBubbleRow, styles.assistantRow]}>
                  <View style={[styles.messageBubble, styles.assistantBubble]}>
                    <ActivityIndicator
                      size="small"
                      color={Colors.primary}
                    />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Share what's on your mind..."
              placeholderTextColor={Colors.textLight}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              testID="chat-input"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <Pressable
              style={[
                styles.sendButton,
                !input.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim()}
              testID="send-button"
            >
              <Send
                size={18}
                color={input.trim() ? Colors.white : Colors.textLight}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  headerLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.textOnPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.accentLight,
    fontWeight: "500" as const,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDark + "60",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  chatArea: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.warmRoseLight + "30",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.primary,
    marginBottom: 12,
    textAlign: "center" as const,
  },
  welcomeText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: "100%",
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
    }),
  },
  suggestionPressed: {
    backgroundColor: Colors.creamDark,
    transform: [{ scale: 0.98 }],
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },
  messagesList: {
    padding: 20,
    paddingBottom: 8,
  },
  messageBubbleRow: {
    marginBottom: 12,
    flexDirection: "row" as const,
  },
  userRow: {
    justifyContent: "flex-end" as const,
  },
  assistantRow: {
    justifyContent: "flex-start" as const,
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: Colors.chatBubbleUser,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: Colors.chatBubbleAI,
    borderBottomLeftRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      web: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
    }),
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.textOnPrimary,
  },
  assistantText: {
    color: Colors.text,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  inputRow: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.creamDark,
  },
});
