export const ENABLE_TEST_MONITORING = true;

export async function startTestSession(
  supabase: any,
  userId: string,
  stepId: string,
  versionId: string,
  device: any
): Promise<string> {
  const { data, error } = await supabase
    .from('test_sessions')
    .insert({ user_id: userId, step_id: stepId, version_id: versionId, device })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function logTestEvent(
  supabase: any,
  sessionId: string,
  type: string,
  payload: Record<string, any> = {}
) {
  if (!ENABLE_TEST_MONITORING) return;
  await supabase.from('test_events').insert({ session_id: sessionId, type, payload });
}

export async function endTestSession(supabase: any, sessionId: string) {
  await supabase
    .from('test_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId);
}


