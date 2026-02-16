import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Wind, Leaf, Shield } from 'lucide-react-native';

import Colors from '@/constants/colors';

type Exercise = 'breathing' | 'grounding' | 'muscle';

interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  cycles: number;
}

const PATTERNS: BreathingPattern[] = [
  {
    name: '4-7-8 Calming Breath',
    description: 'Reduces anxiety and helps you fall asleep',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    cycles: 4,
  },
  {
    name: 'Box Breathing',
    description: 'Used by Navy SEALs to stay calm under pressure',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    cycles: 4,
  },
  {
    name: 'Gentle Breath',
    description: 'Simple and soothing for overwhelming moments',
    inhale: 3,
    hold: 2,
    exhale: 5,
    holdAfter: 0,
    cycles: 6,
  },
];

const GROUNDING_STEPS = [
  { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see right now', color: '#6BAF7B' },
  { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can touch', color: '#D4A574' },
  { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear', color: '#8FA3B0' },
  { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell', color: '#C4897B' },
  { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste', color: '#B8A88A' },
];

export default function BreathingScreen() {
  const [activeExercise, setActiveExercise] = useState<Exercise>('breathing');
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingStarted, setGroundingStarted] = useState(false);
  const breathScale = useRef(new Animated.Value(0.6)).current;
  const breathOpacity = useRef(new Animated.Value(0.3)).current;
  const phaseAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pattern = PATTERNS[selectedPattern];

  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanupTimer;
  }, [cleanupTimer]);

  const animateBreathCycle = useCallback(
    (cycle: number) => {
      if (cycle >= pattern.cycles) {
        setIsBreathing(false);
        setBreathPhase('Complete');
        breathScale.setValue(0.6);
        breathOpacity.setValue(0.3);
        return;
      }

      setCurrentCycle(cycle + 1);

      setBreathPhase('Breathe in...');
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.parallel([
        Animated.timing(breathScale, { toValue: 1, duration: pattern.inhale * 1000, useNativeDriver: true }),
        Animated.timing(breathOpacity, { toValue: 0.8, duration: pattern.inhale * 1000, useNativeDriver: true }),
      ]).start(() => {
        if (pattern.hold > 0) {
          setBreathPhase('Hold...');
          timerRef.current = setTimeout(() => {
            setBreathPhase('Breathe out...');
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Animated.parallel([
              Animated.timing(breathScale, { toValue: 0.6, duration: pattern.exhale * 1000, useNativeDriver: true }),
              Animated.timing(breathOpacity, { toValue: 0.3, duration: pattern.exhale * 1000, useNativeDriver: true }),
            ]).start(() => {
              if (pattern.holdAfter > 0) {
                setBreathPhase('Hold...');
                timerRef.current = setTimeout(() => animateBreathCycle(cycle + 1), pattern.holdAfter * 1000);
              } else {
                animateBreathCycle(cycle + 1);
              }
            });
          }, pattern.hold * 1000);
        } else {
          setBreathPhase('Breathe out...');
          Animated.parallel([
            Animated.timing(breathScale, { toValue: 0.6, duration: pattern.exhale * 1000, useNativeDriver: true }),
            Animated.timing(breathOpacity, { toValue: 0.3, duration: pattern.exhale * 1000, useNativeDriver: true }),
          ]).start(() => animateBreathCycle(cycle + 1));
        }
      });
    },
    [pattern, breathScale, breathOpacity]
  );

  const startBreathing = () => {
    setIsBreathing(true);
    setCurrentCycle(0);
    breathScale.setValue(0.6);
    breathOpacity.setValue(0.3);
    animateBreathCycle(0);
  };

  const stopBreathing = () => {
    cleanupTimer();
    breathScale.stopAnimation();
    breathOpacity.stopAnimation();
    setIsBreathing(false);
    setBreathPhase('');
    setCurrentCycle(0);
    breathScale.setValue(0.6);
    breathOpacity.setValue(0.3);
  };

  const nextGroundingStep = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (groundingStep < GROUNDING_STEPS.length - 1) {
      setGroundingStep(groundingStep + 1);
      Animated.timing(phaseAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start(() => phaseAnim.setValue(0));
    } else {
      setGroundingStarted(false);
      setGroundingStep(0);
    }
  };

  const exercises: { key: Exercise; label: string; icon: React.ComponentType<{ size: number; color: string }> }[] = [
    { key: 'breathing', label: 'Breathing', icon: Wind },
    { key: 'grounding', label: '5-4-3-2-1', icon: Leaf },
    { key: 'muscle', label: 'Relax', icon: Shield },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Calm & Ground', headerBackTitle: 'Home' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabRow}>
          {exercises.map((ex) => {
            const Icon = ex.icon;
            return (
              <Pressable
                key={ex.key}
                style={[styles.tab, activeExercise === ex.key && styles.tabActive]}
                onPress={() => { setActiveExercise(ex.key); stopBreathing(); }}
              >
                <Icon size={16} color={activeExercise === ex.key ? Colors.textOnPrimary : Colors.textSecondary} />
                <Text style={[styles.tabText, activeExercise === ex.key && styles.tabTextActive]}>
                  {ex.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeExercise === 'breathing' && (
          <>
            <View style={styles.patternPicker}>
              {PATTERNS.map((p, i) => (
                <Pressable
                  key={i}
                  style={[styles.patternCard, selectedPattern === i && styles.patternCardActive]}
                  onPress={() => { if (!isBreathing) setSelectedPattern(i); }}
                >
                  <Text style={[styles.patternName, selectedPattern === i && styles.patternNameActive]}>
                    {p.name}
                  </Text>
                  <Text style={[styles.patternDesc, selectedPattern === i && styles.patternDescActive]}>
                    {p.description}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.breathContainer}>
              <Animated.View
                style={[
                  styles.breathCircleOuter,
                  { transform: [{ scale: breathScale }], opacity: breathOpacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.breathCircleInner,
                  { transform: [{ scale: breathScale }] },
                ]}
              >
                <Text style={styles.breathPhaseText}>
                  {isBreathing ? breathPhase : 'Ready'}
                </Text>
                {isBreathing && currentCycle > 0 && (
                  <Text style={styles.breathCycleText}>
                    {currentCycle} / {pattern.cycles}
                  </Text>
                )}
              </Animated.View>
            </View>

            <Pressable
              style={[styles.actionButton, isBreathing && styles.stopButton]}
              onPress={isBreathing ? stopBreathing : startBreathing}
              testID="breathing-start"
            >
              <Text style={styles.actionButtonText}>
                {isBreathing ? 'Stop' : 'Begin'}
              </Text>
            </Pressable>
          </>
        )}

        {activeExercise === 'grounding' && (
          <View style={styles.groundingContainer}>
            {!groundingStarted ? (
              <View style={styles.groundingIntro}>
                <Text style={styles.groundingTitle}>5-4-3-2-1 Grounding</Text>
                <Text style={styles.groundingDesc}>
                  This technique uses your five senses to bring you back to the present moment when anxiety or overwhelming grief hits.
                </Text>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => { setGroundingStarted(true); setGroundingStep(0); }}
                >
                  <Text style={styles.actionButtonText}>Start Exercise</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.groundingActive}>
                <View style={[styles.groundingBadge, { backgroundColor: GROUNDING_STEPS[groundingStep].color + '20' }]}>
                  <Text style={[styles.groundingCount, { color: GROUNDING_STEPS[groundingStep].color }]}>
                    {GROUNDING_STEPS[groundingStep].count}
                  </Text>
                </View>
                <Text style={styles.groundingSense}>{GROUNDING_STEPS[groundingStep].sense}</Text>
                <Text style={styles.groundingPrompt}>{GROUNDING_STEPS[groundingStep].prompt}</Text>
                <View style={styles.groundingProgress}>
                  {GROUNDING_STEPS.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.progressDot,
                        i <= groundingStep && { backgroundColor: GROUNDING_STEPS[groundingStep].color },
                      ]}
                    />
                  ))}
                </View>
                <Pressable style={styles.actionButton} onPress={nextGroundingStep}>
                  <Text style={styles.actionButtonText}>
                    {groundingStep < GROUNDING_STEPS.length - 1 ? 'Next' : 'Complete'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {activeExercise === 'muscle' && (
          <View style={styles.muscleContainer}>
            <Text style={styles.muscleTitle}>Progressive Muscle Relaxation</Text>
            <Text style={styles.muscleDesc}>
              Tense each muscle group for 5 seconds, then release. Notice the difference between tension and relaxation.
            </Text>
            {[
              { area: 'Hands & Fists', instruction: 'Clench your fists tightly. Hold... and release.' },
              { area: 'Arms & Biceps', instruction: 'Flex your biceps. Hold the tension... and let go.' },
              { area: 'Shoulders', instruction: 'Raise your shoulders to your ears. Hold... and drop them.' },
              { area: 'Face', instruction: 'Scrunch your face tightly. Hold... and smooth it out.' },
              { area: 'Stomach', instruction: 'Tighten your abdominal muscles. Hold... and release.' },
              { area: 'Legs', instruction: 'Tense your thighs and calves. Hold... and relax.' },
              { area: 'Feet', instruction: 'Curl your toes downward. Hold... and release.' },
            ].map((step, i) => (
              <View key={i} style={styles.muscleStep}>
                <View style={styles.muscleStepNumber}>
                  <Text style={styles.muscleStepNumberText}>{i + 1}</Text>
                </View>
                <View style={styles.muscleStepContent}>
                  <Text style={styles.muscleStepArea}>{step.area}</Text>
                  <Text style={styles.muscleStepInstruction}>{step.instruction}</Text>
                </View>
              </View>
            ))}
          </View>
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
    padding: 24,
    paddingBottom: 40,
  },
  tabRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textOnPrimary,
  },
  patternPicker: {
    gap: 10,
    marginBottom: 32,
  },
  patternCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  patternName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  patternNameActive: {
    color: Colors.primary,
  },
  patternDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  patternDescActive: {
    color: Colors.primaryLight,
  },
  breathContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: 220,
    marginBottom: 24,
  },
  breathCircleOuter: {
    position: 'absolute' as const,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryLight + '30',
  },
  breathCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  breathPhaseText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  breathCycleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  stopButton: {
    backgroundColor: Colors.warmRose,
  },
  actionButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  groundingContainer: {
    marginTop: 8,
  },
  groundingIntro: {
    alignItems: 'center' as const,
    gap: 16,
  },
  groundingTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  groundingDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  groundingActive: {
    alignItems: 'center' as const,
    gap: 16,
  },
  groundingBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  groundingCount: {
    fontSize: 48,
    fontWeight: '800' as const,
  },
  groundingSense: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 3,
    color: Colors.textSecondary,
  },
  groundingPrompt: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  groundingProgress: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  muscleContainer: {
    marginTop: 8,
  },
  muscleTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  muscleDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  muscleStep: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center' as const,
    gap: 14,
  },
  muscleStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  muscleStepNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  muscleStepContent: {
    flex: 1,
  },
  muscleStepArea: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  muscleStepInstruction: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
