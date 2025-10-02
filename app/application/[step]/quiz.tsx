import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, BackHandler, Modal, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import applicationSteps from '@/constants/applicationSteps';
import { useAuth } from '@/context/AuthContext';
import { getOrCreateDailyQuiz, QuizQuestion, clearDailyQuiz, submitDailyQuiz, getDailyQuizStatus } from '@/utils/dailyQuiz';

export default function DailyQuizScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const { user } = useAuth();

  const stepData = useMemo(() => applicationSteps.find(s => s.id === step), [step]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [picked, setPicked] = useState<Array<number | null>>([]);
  const [locked, setLocked] = useState(false);
  const [lastResult, setLastResult] = useState<{ picks: number[]; correctCount: number; score: number } | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user?.id || !stepData) return;
      try {
        setLoading(true);
        setError(null);
        // Check status; if submitted and not expired, lock and show review
        const status = await getDailyQuizStatus(user.id, stepData.id);
        if (status.quiz && !status.isExpired && status.isSubmitted) {
          setLocked(true);
          setQuestions(status.quiz.questions);
          setPicked(status.quiz.picks || new Array(status.quiz.questions.length).fill(null));
          setLastResult(status.quiz.picks ? { picks: status.quiz.picks, correctCount: status.quiz.correctCount || 0, score: status.quiz.score || 0 } : null);
          setRemainingMs(status.remainingMs);
        } else {
          const quiz = await getOrCreateDailyQuiz(user.id, stepData.id);
          setQuestions(quiz.questions);
          setPicked(new Array(quiz.questions.length).fill(null));
          setLocked(false);
          setLastResult(null);
          setRemainingMs(0);
          // Start quiz timer: 10 minutes
          setTimeLeft(10 * 60); // 10 minutes in seconds
          setQuizStarted(true);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id, stepData?.id]);

  const submitQuiz = useCallback(async (isTimeUp: boolean = false) => {
    if (locked) return;
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Mark unanswered questions as incorrect (index -1)
    const finalPicks = picked.map(p => p === null ? -1 : p);
    try {
      const res = await submitDailyQuiz(user!.id, stepData!.id, finalPicks);
      setLocked(true);
      setLastResult({ picks: finalPicks, correctCount: res.correctCount || 0, score: res.score || 0 });
      
      const message = isTimeUp 
        ? `Time's up! Your quiz has been automatically submitted. You scored ${(res.correctCount || 0)}/5`
        : `You scored ${(res.correctCount || 0)}/5`;
      
      Alert.alert('Quiz Complete', message, [
        { text: 'OK' }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to submit');
    }
  }, [locked, picked, user, stepData]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !locked) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            submitQuiz(true);
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
  }, [quizStarted, timeLeft, locked, submitQuiz]);

  // Back handler to prevent accidental exit during quiz
  useEffect(() => {
    const backAction = () => {
      if (quizStarted && !locked) {
        setShowExitConfirmation(true);
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [quizStarted, locked]);

  const submit = async () => {
    if (picked.some(p => p === null)) {
      Alert.alert('Incomplete', 'Answer all 5 questions.');
      return;
    }
    await submitQuiz(false);
  };

  const handleExitQuiz = useCallback(async () => {
    setShowExitConfirmation(false);
    
    // Submit quiz with fail grade (all unanswered questions marked as incorrect)
    const finalPicks = picked.map(p => p === null ? -1 : p);
    
    try {
      const res = await submitDailyQuiz(user!.id, stepData!.id, finalPicks);
      setLocked(true);
      setLastResult({ picks: finalPicks, correctCount: res.correctCount || 0, score: res.score || 0 });
      
      Alert.alert('Quiz Withdrawn', `You have withdrawn from the quiz. Score: ${(res.correctCount || 0)}/5 (Failed)`, [
        { text: 'OK' }
      ]);
    } catch (e: any) {
      console.error('Quiz withdrawal error:', e);
      Alert.alert('Error', `Failed to submit withdrawn quiz: ${e?.message || 'Unknown error'}`);
    }
  }, [picked, user, stepData]);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirmation(false);
  }, []);

  if (!stepData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.text}>Invalid step</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.text}>Loading daily quiz…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.text}>{error}</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Exit confirmation modal */}
      <Modal visible={showExitConfirmation} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚠️ Exit Quiz?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to exit this quiz? If you exit now:
            </Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• Your quiz will be automatically submitted</Text>
              <Text style={styles.warningItem}>• Unanswered questions will be marked as incorrect</Text>
              <Text style={styles.warningItem}>• This will count as a failed attempt</Text>
              <Text style={styles.warningItem}>• You cannot resume the quiz later</Text>
            </View>
            <Text style={styles.modalBody}>
              This action cannot be undone. Do you want to continue?
            </Text>
            <View style={styles.modalActions}>
              <Button title="Continue Quiz" variant="outline" onPress={handleCancelExit} />
              <Button title="Exit & Submit" onPress={handleExitQuiz} />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (quizStarted && !locked) {
                setShowExitConfirmation(true);
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>OACP Daily Quiz</Text>
          </View>
          <View style={styles.spacer} />
        </View>
        {quizStarted && !locked && (
          <View style={styles.timerContainer}>
            <Text style={[
              styles.timer,
              { color: timeLeft <= 60 ? Colors.error : Colors.primary }
            ]}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={styles.timerLabel}>Time Left</Text>
          </View>
        )}
      </View>
      {locked && lastResult && (
        <View style={[styles.block, { borderColor: Colors.success }]}>
          <Text style={styles.summaryTitle}>Your last result (locks for 24h)</Text>
          <Text style={styles.summaryText}>Score: {lastResult.correctCount}/5 ({lastResult.score}%)</Text>
          {remainingMs > 0 && (
            <Text style={styles.summarySub}>Next quiz refresh in ~{Math.ceil(remainingMs / (60 * 1000))} min</Text>
          )}
        </View>
      )}
      {questions.map((q, qi) => (
        <View key={q.id} style={styles.block}>
          <Text style={styles.prompt}>{qi + 1}. {q.prompt}</Text>
          <View style={{ gap: 8 }}>
            {q.choices.map((c, ci) => {
              const selected = picked[qi] === ci;
              const optionLabel = String.fromCharCode(97 + ci); // a, b, c, d
              return (
                <TouchableOpacity
                  key={ci}
                  onPress={() => { if (locked) return; setPicked(prev => { const next = [...prev]; next[qi] = ci; return next; }); }}
                  style={[styles.choice, selected && styles.choiceSelected]}
                >
                  <View style={styles.choiceContent}>
                    <Text style={styles.choiceLabel}>{optionLabel})</Text>
                    <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{c}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {locked && lastResult && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.reviewTitle}>Your answer: {typeof lastResult.picks[qi] === 'number' ? String.fromCharCode(65 + lastResult.picks[qi]) : '-'}</Text>
              <Text style={styles.reviewText}>Correct answer: {String.fromCharCode(65 + q.correct_index)}</Text>
            </View>
          )}
        </View>
      ))}

      <View style={styles.footer}>
        <Button title="Reset (dev)" variant="outline" onPress={async () => { if (user?.id) { await clearDailyQuiz(user.id, stepData.id); Alert.alert('Reset', 'Daily quiz cache cleared. Re-open to refresh.'); setLocked(false); setLastResult(null); } }} />
        <Button title={locked ? "Locked" : "Submit"} onPress={submit} disabled={locked} />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
  text: { color: Colors.text, fontSize: 16 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  spacer: {
    minWidth: 60,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  block: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  prompt: { fontSize: 16, color: Colors.text, marginBottom: 8 },
  choice: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, borderRadius: 10, padding: 10 },
  choiceSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
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
  choiceText: { color: Colors.text, fontSize: 15, flex: 1 },
  choiceTextSelected: { color: Colors.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingTop: 8 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  summaryText: { fontSize: 15, color: Colors.text },
  summarySub: { fontSize: 13, color: Colors.textSecondary },
  reviewTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  reviewText: { fontSize: 14, color: Colors.textSecondary },
});


