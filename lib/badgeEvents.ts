import { supabase } from './supabase';

export type BadgeEventType =
  | 'profile.completed'
  | 'application.step.completed'
  | 'booking.confirmed'
  | 'workout.logged'
  | 'purchase.succeeded';

export async function emitBadgeEvent(type: BadgeEventType, data: Record<string, unknown> = {}) {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user?.id) return;

    const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/badge-engine`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ type, user_id: user.id, data }),
    });
    if (!resp.ok) {
      console.warn('emitBadgeEvent failed', await resp.text());
      return;
    }
    const json = await resp.json();
    return json;
  } catch (err) {
    console.warn('emitBadgeEvent error', err);
  }
}


