import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, AppState, Modal, Platform, BackHandler, SafeAreaView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import applicationSteps from "@/constants/applicationSteps";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ENABLE_TEST_MONITORING, startTestSession, logTestEvent, endTestSession } from "@/utils/testTelemetry";

type TestVersion = {
  id: string;
  step_id: string;
  title: string | null;
  published_at: string;
  is_active: boolean;
};

type TestQuestion = {
  id: string;
  version_id: string;
  order_index: number;
  prompt: string;
  choices: string[] | any; // jsonb
  correct_index: number;
};

const QUESTIONS_PER_TEST = 50;
const PASS_MARK_PERCENT = 80;
const ATTEMPTS_PER_MONTH = 2;

export default function StepMonthlyTestScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<TestVersion | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [picked, setPicked] = useState<Array<number | null>>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(true);
  const [attemptsThisMonth, setAttemptsThisMonth] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [testStarted, setTestStarted] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const lastActionTsRef = useRef<number>(Date.now());
  const appStateRef = useRef(AppState.currentState);
  const timerRef = useRef<number | null>(null);

  const stepData = useMemo(() => {
    const found = applicationSteps.find(s => s.id === step);
    return found;
  }, [step]);

  const monthStartIso = useMemo(() => {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    return start.toISOString();
  }, []);

  const fetchVersionAndQuestions = useCallback(async () => {
    if (!step || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const nowIso = new Date().toISOString();
      const { data: versions, error: vErr } = await supabase
        .from('test_versions')
        .select('*')
        .eq('step_id', String(step))
        .eq('is_active', true)
        .lte('published_at', nowIso)
        .order('published_at', { ascending: false })
        .limit(1);
      if (vErr) throw vErr;
      if (!versions || versions.length === 0) {
        setError('No test available for this step yet.');
        setLoading(false);
        return;
      }
      const v = versions[0] as TestVersion;
      setVersion(v);

      const { data: qData, error: qErr } = await supabase
        .from('test_questions')
        .select('*')
        .eq('version_id', v.id)
        .order('order_index', { ascending: true })
        .limit(QUESTIONS_PER_TEST);
      if (qErr) throw qErr;
      const normalized = (qData || []).map((q: any) => ({
        ...q,
        choices: Array.isArray(q.choices) ? q.choices : (q.choices?.choices || q.choices),
      })) as TestQuestion[];

      // Shuffle choices per question but keep correct index accurate client-side
      function shuffleChoices(choices: string[], correctIndex: number): { choices: string[]; correctIndex: number } {
        const indices = choices.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const newChoices = indices.map(i => choices[i]);
        const newCorrectIndex = indices.indexOf(correctIndex);
        return { choices: newChoices, correctIndex: newCorrectIndex };
      }

      const shuffled = normalized.map(q => {
        const baseChoices = (q.choices as any[]).map(String);
        const { choices: c, correctIndex: ci } = shuffleChoices(baseChoices, q.correct_index);
        return { ...q, choices: c, correct_index: ci } as TestQuestion;
      });
      setQuestions(shuffled);
      setPicked(new Array(Math.min(QUESTIONS_PER_TEST, shuffled.length)).fill(null));

      // Load attempts count for cap
      const { count, error: cErr } = await supabase
        .from('test_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('version_id', v.id)
        .gte('created_at', monthStartIso);
      if (cErr) throw cErr;
      setAttemptsThisMonth(count ?? 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load test.');
    } finally {
      setLoading(false);
    }
  }, [step, user?.id, monthStartIso]);

  useEffect(() => {
    fetchVersionAndQuestions();
  }, [fetchVersionAndQuestions]);

  const submitTest = useCallback(async (isTimeUp: boolean = false) => {
    if (!user?.id || !version || !stepData) return;
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const total = questions.length;
    // Mark unanswered questions as incorrect (index -1)
    const finalPicks = picked.map(p => p === null ? -1 : p);
    const correctCount = questions.reduce((acc, q, idx) => acc + (finalPicks[idx] === q.correct_index ? 1 : 0), 0);
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= PASS_MARK_PERCENT;

    try {
      const { data, error } = await supabase.from('test_attempts').insert({
        user_id: user.id,
        step_id: stepData.id,
        version_id: version.id,
        score,
        correct_count: correctCount,
        total,
        passed,
      });
      
      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (sessionId) {
        await logTestEvent(supabase, sessionId, 'submit', { score, correct_count: correctCount, time_up: isTimeUp });
        await endTestSession(supabase, sessionId);
      }
      
      const message = isTimeUp 
        ? `Time's up! Your test has been automatically submitted. Score: ${score}%`
        : `Score: ${score}%`;
      
      Alert.alert(passed ? 'Passed' : 'Try Again', message, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error('Test submission error:', e);
      Alert.alert('Error', `Failed to submit test: ${e?.message || 'Unknown error'}`);
    }
  }, [user?.id, version, stepData, questions, picked, sessionId]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            submitTest(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, timeLeft, submitTest]);

  // Back handler to prevent accidental exit during test
  useEffect(() => {
    const backAction = () => {
      if (testStarted && !showConsent) {
        setShowExitConfirmation(true);
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [testStarted, showConsent]);

  // AppState telemetry
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (!sessionId) return;
      if (appStateRef.current.match(/active/) && nextState.match(/inactive|background/)) {
        await logTestEvent(supabase, sessionId, 'app_blur', {});
      } else if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        await logTestEvent(supabase, sessionId, 'app_focus', {});
      }
      appStateRef.current = nextState;
    });
    return () => {
      // @ts-ignore
      if (sub && sub.remove) sub.remove();
    };
  }, [sessionId]);

  const handleStart = useCallback(async () => {
    if (!user?.id || !version || !stepData) return;
    if ((attemptsThisMonth ?? 0) >= ATTEMPTS_PER_MONTH) {
      Alert.alert('Attempt limit reached', 'You have used your 2 attempts for this month.');
      router.back();
      return;
    }
    try {
      const device = { platform: Platform.OS };
      const id = await startTestSession(supabase, user.id, stepData.id, version.id, device);
      setSessionId(id);
      if (ENABLE_TEST_MONITORING) {
        await logTestEvent(supabase, id, 'start', { question_count: questions.length });
        if (questions[0]) {
          await logTestEvent(supabase, id, 'question_view', { question_id: questions[0].id, index: 0 });
        }
      }
      setShowConsent(false);
      setTestStarted(true);
      // Start timer: 60 minutes for sample test
      setTimeLeft(60 * 60); // 60 minutes in seconds
      lastActionTsRef.current = Date.now();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to start test.');
      router.back();
    }
  }, [user?.id, version, stepData, attemptsThisMonth, questions]);

  const handlePick = useCallback(async (choiceIndex: number) => {
    setPicked(prev => {
      const next = [...prev];
      next[currentIndex] = choiceIndex;
      return next;
    });
    if (sessionId) {
      const q = questions[currentIndex];
      const latencyMs = Date.now() - lastActionTsRef.current;
      await logTestEvent(supabase, sessionId, 'answer_select', { question_id: q.id, selected_index: choiceIndex, latency_ms: latencyMs });
      lastActionTsRef.current = Date.now();
    }
  }, [currentIndex, sessionId, questions]);

  const goTo = useCallback(async (toIndex: number) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    setCurrentIndex(toIndex);
    if (sessionId) {
      await logTestEvent(supabase, sessionId, toIndex > currentIndex ? 'next' : 'prev', { to: toIndex });
      const q = questions[toIndex];
      await logTestEvent(supabase, sessionId, 'question_view', { question_id: q.id, index: toIndex });
      lastActionTsRef.current = Date.now();
    }
  }, [currentIndex, sessionId, questions]);

  const handleSubmit = useCallback(async () => {
    if (picked.some(p => p === null)) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    await submitTest(false);
  }, [submitTest]);

  const handleExitTest = useCallback(async () => {
    setShowExitConfirmation(false);
    
    // Submit test with fail grade (all unanswered questions marked as incorrect)
    const total = questions.length;
    const finalPicks = picked.map(p => p === null ? -1 : p);
    const correctCount = questions.reduce((acc, q, idx) => acc + (finalPicks[idx] === q.correct_index ? 1 : 0), 0);
    const score = Math.round((correctCount / total) * 100);
    
    try {
      const { data, error } = await supabase.from('test_attempts').insert({
        user_id: user?.id,
        step_id: stepData?.id,
        version_id: version?.id,
        score,
        correct_count: correctCount,
        total,
        passed: false,
      });
      
      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (sessionId) {
        await logTestEvent(supabase, sessionId, 'withdraw', { score, correct_count: correctCount });
        await endTestSession(supabase, sessionId);
      }
      
      Alert.alert('Test Withdrawn', `You have withdrawn from the test. Score: ${score}% (Failed)`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error('Test withdrawal error:', e);
      Alert.alert('Error', `Failed to submit withdrawn test: ${e?.message || 'Unknown error'}`);
      router.back();
    }
  }, [user?.id, version, stepData, questions, picked, sessionId]);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirmation(false);
  }, []);

  const answeredCount = useMemo(() => picked.filter(p => p !== null).length, [picked]);

  if (!stepData) {
    return (
      <View style={[styles.centered, styles.container]}>
        <Text style={styles.text}>Invalid step</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centered, styles.container]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.text}>Loading test…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, styles.container]}>
        <Text style={styles.text}>{error}</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!version || questions.length === 0) {
    return (
      <View style={[styles.centered, styles.container]}>
        <Text style={styles.text}>No questions available.</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const q = questions[currentIndex];
  const choices: string[] = Array.isArray(q.choices) ? (q.choices as string[]) : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Consent modal */}
      <Modal visible={showConsent} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>About this Test</Text>
            <Text style={styles.modalBody}>
              This is a formal, timed knowledge assessment for the current step. We record timing and basic device/app signals (e.g., focus changes and navigation) to help ensure test integrity. No audio or video is captured.
            </Text>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => router.back()} />
              <Button title="Start Test" onPress={handleStart} />
            </View>
            {attemptsThisMonth !== null && (
              <Text style={styles.attemptsNote}>Attempts used this month: {attemptsThisMonth}/{ATTEMPTS_PER_MONTH}</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Exit confirmation modal */}
      <Modal visible={showExitConfirmation} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚠️ Exit Test?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to exit this test? If you exit now:
            </Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• Your test will be automatically submitted</Text>
              <Text style={styles.warningItem}>• Unanswered questions will be marked as incorrect</Text>
              <Text style={styles.warningItem}>• This will count as a failed attempt</Text>
              <Text style={styles.warningItem}>• You cannot resume the test later</Text>
            </View>
            <Text style={styles.modalBody}>
              This action cannot be undone. Do you want to continue?
            </Text>
            <View style={styles.modalActions}>
              <Button title="Continue Test" variant="outline" onPress={handleCancelExit} />
              <Button title="Exit & Submit" onPress={handleExitTest} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (testStarted && !showConsent) {
                setShowExitConfirmation(true);
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>OACP Sample Test</Text>
          </View>
          <View style={styles.spacer} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.subtitle}>{answeredCount}/{questions.length} answered</Text>
          {testStarted && (
            <View style={styles.timerContainer}>
              <Text style={[
                styles.timer,
                { color: timeLeft <= 300 ? Colors.error : Colors.primary }
              ]}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={styles.timerLabel}>Time Left</Text>
            </View>
          )}
        </View>
      </View>

      {/* Question */}
      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.prompt}>{currentIndex + 1}. {q.prompt}</Text>
        <View style={styles.choicesContainer}>
          {choices.map((c, idx) => {
            const selected = picked[currentIndex] === idx;
            const optionLabel = String.fromCharCode(97 + idx); // a, b, c, d
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handlePick(idx)}
                style={[styles.choice, selected ? styles.choiceSelected : null]}
                disabled={showConsent}
              >
                <View style={styles.choiceContent}>
                  <Text style={styles.choiceLabel}>{optionLabel})</Text>
                  <Text style={[styles.choiceText, selected ? styles.choiceTextSelected : null]}>
                    {c}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer nav */}
      <View style={styles.footer}>
        <Button title="Prev" variant="outline" onPress={() => goTo(currentIndex - 1)} disabled={currentIndex === 0 || showConsent} />
        {currentIndex < questions.length - 1 ? (
          <Button title="Next" onPress={() => goTo(currentIndex + 1)} disabled={showConsent} />
        ) : (
          <Button title="Submit" onPress={handleSubmit} disabled={showConsent} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: Colors.white,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  spacer: {
    minWidth: 60,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  prompt: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 16,
  },
  choicesContainer: {
    gap: 8,
  },
  choice: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
  },
  choiceSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  choiceLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 20,
  },
  choiceText: {
    color: Colors.text,
    fontSize: 15,
    flex: 1,
  },
  choiceTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  attemptsNote: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  warningList: {
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  warningItem: {
    fontSize: 14,
    color: Colors.error,
    marginBottom: 4,
    fontWeight: '500',
  },
});


