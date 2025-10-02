import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type QuizQuestion = {
  id: string;
  version_id: string;
  prompt: string;
  choices: string[];
  correct_index: number;
};

type StoredDailyQuiz = {
  stepId: string;
  versionId: string;
  createdAt: string; // ISO
  questions: QuizQuestion[];
  // Attempt lock state
  submittedAt?: string; // ISO when user submitted within this 24h window
  picks?: number[]; // user's selected indexes, length = 5
  correctCount?: number;
  score?: number; // 0..100
};

function getStorageKey(userId: string, stepId: string): string {
  return `daily_quiz:${userId}:${stepId}`;
}

function isExpired(createdAtIso: string): boolean {
  const created = new Date(createdAtIso).getTime();
  const now = Date.now();
  return now - created >= 24 * 60 * 60 * 1000; // 24h
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export async function getOrCreateDailyQuiz(userId: string, stepId: string): Promise<StoredDailyQuiz> {
  if (!userId) throw new Error('Missing user ID');
  if (!stepId) throw new Error('Missing step ID');

  const key = getStorageKey(userId, stepId);
  try {
    const cachedRaw = await AsyncStorage.getItem(key);
    if (cachedRaw) {
      const cached: StoredDailyQuiz = JSON.parse(cachedRaw);
      if (cached && cached.stepId === stepId && !isExpired(cached.createdAt)) {
        return cached;
      }
    }
  } catch {}

  // Fetch latest version
  const nowIso = new Date().toISOString();
  const { data: versions, error: vErr } = await supabase
    .from('test_versions')
    .select('*')
    .eq('step_id', stepId)
    .eq('is_active', true)
    .lte('published_at', nowIso)
    .order('published_at', { ascending: false })
    .limit(1);
  if (vErr) throw vErr;
  if (!versions || versions.length === 0) throw new Error('No test version found');
  const version = versions[0];

  // Fetch questions for version
  const { data: qData, error: qErr } = await supabase
    .from('test_questions')
    .select('id, version_id, prompt, choices, correct_index')
    .eq('version_id', version.id)
    .order('order_index', { ascending: true });
  if (qErr) throw qErr;

  const normalized: QuizQuestion[] = (qData || []).map((q: any) => ({
    id: q.id,
    version_id: q.version_id,
    prompt: q.prompt,
    choices: Array.isArray(q.choices) ? q.choices : (q.choices?.choices || q.choices),
    correct_index: q.correct_index,
  }));

  const selected = pickRandom(normalized, 5);
  const payload: StoredDailyQuiz = {
    stepId,
    versionId: version.id,
    createdAt: new Date().toISOString(),
    questions: selected,
  };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch {}
  return payload;
}

export async function clearDailyQuiz(userId: string, stepId: string): Promise<void> {
  const key = getStorageKey(userId, stepId);
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

export async function submitDailyQuiz(userId: string, stepId: string, picks: number[]): Promise<StoredDailyQuiz> {
  const key = getStorageKey(userId, stepId);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) throw new Error('Quiz not initialized');
  const quiz: StoredDailyQuiz = JSON.parse(raw);
  if (!quiz || !quiz.questions?.length) throw new Error('Quiz not available');
  if (!isExpired(quiz.createdAt) && quiz.submittedAt) {
    throw new Error('Quiz already submitted. Try again after 24 hours.');
  }
  if (picks.length !== quiz.questions.length) throw new Error('Invalid answers');
  const correctCount = quiz.questions.reduce((acc, q, idx) => acc + ((picks[idx] as number) === q.correct_index ? 1 : 0), 0);
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const updated: StoredDailyQuiz = { ...quiz, submittedAt: new Date().toISOString(), picks, correctCount, score };
  await AsyncStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export async function getDailyQuizStatus(userId: string, stepId: string): Promise<{
  quiz: StoredDailyQuiz | null;
  isExpired: boolean;
  isSubmitted: boolean;
  remainingMs: number;
}> {
  const key = getStorageKey(userId, stepId);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return { quiz: null, isExpired: true, isSubmitted: false, remainingMs: 0 };
  const quiz: StoredDailyQuiz = JSON.parse(raw);
  const expired = isExpired(quiz.createdAt);
  let remainingMs = 0;
  if (!expired) {
    const created = new Date(quiz.createdAt).getTime();
    const unlockAt = created + 24 * 60 * 60 * 1000;
    remainingMs = Math.max(0, unlockAt - Date.now());
  }
  return { quiz, isExpired: expired, isSubmitted: !!quiz.submittedAt, remainingMs };
}


