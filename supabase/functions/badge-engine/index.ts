import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EventPayload = {
  type: string; // e.g., 'profile.completed'
  user_id: string;
  data?: Record<string, unknown>;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { type, user_id, data }: EventPayload = await req.json();
    if (!type || !user_id) {
      return json({ error: 'Missing type or user_id' }, 400);
    }

    const activeBadges = await getActiveBadges(supabase);
    const results: Array<{ badge_id: string; slug: string; awarded: boolean; reason?: string }> = [];

    for (const badge of activeBadges) {
      const shouldAward = await evaluateBadgeCriteria(supabase, badge, { type, user_id, data });
      if (!shouldAward) {
        continue;
      }

      const awarded = await awardBadgeIfNotExists(supabase, user_id, badge, { event: type, data });
      results.push({ badge_id: badge.id, slug: badge.slug, awarded });
    }

    return json({ success: true, results });
  } catch (error) {
    console.error('Badge engine error:', error);
    return json({ error: (error as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status });
}

async function getActiveBadges(supabase: any) {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('active', true);
  if (error) throw error;
  return data || [];
}

async function evaluateBadgeCriteria(supabase: any, badge: any, event: EventPayload): Promise<boolean> {
  const criteria = badge.criteria || {};
  const now = new Date();
  if (badge.starts_at && new Date(badge.starts_at) > now) return false;
  if (badge.ends_at && new Date(badge.ends_at) < now) return false;

  // Simple types supported per acceptance criteria
  switch (badge.slug) {
    case 'profile_complete':
      return event.type === 'profile.completed';
    case 'milestone_i': {
      if (event.type !== 'application.step.completed') return false;
      const { data, error } = await supabase
        .from('application_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', event.user_id)
        .eq('status', 'completed');
      if (error) return false;
      return (data?.length ?? 0) >= 3;
    }
    case 'first_booking':
      return event.type === 'booking.confirmed';
    case 'supporter':
      // allow purchase.succeeded with subscription flag
      return event.type === 'purchase.succeeded' && event.data?.kind === 'subscription';
    default:
      // Generic fallback: match by criteria.on
      if (criteria?.on && criteria.on === event.type) return true;
      return false;
  }
}

async function awardBadgeIfNotExists(supabase: any, user_id: string, badge: any, evidence: Record<string, unknown>) {
  // Check if already awarded
  const { data: existing, error: checkError } = await supabase
    .from('user_badges')
    .select('id, revoked_at')
    .eq('user_id', user_id)
    .eq('badge_id', badge.id)
    .maybeSingle();
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Check existing error:', checkError);
  }
  if (existing && !existing.revoked_at) {
    return false;
  }

  const { error: insertError } = await supabase.from('user_badges').upsert({
    user_id,
    badge_id: badge.id,
    earned_at: new Date().toISOString(),
    revoked_at: null,
    evidence,
    source: 'system',
  }, { onConflict: 'user_id,badge_id' });
  if (insertError) {
    console.error('Award insert error:', insertError);
    await supabase.from('badge_events').insert({
      user_id,
      badge_id: badge.id,
      event_type: 'failed',
      payload: { error: insertError.message, evidence },
    });
    return false;
  }

  await supabase.from('badge_events').insert({
    user_id,
    badge_id: badge.id,
    event_type: 'issued',
    payload: evidence,
  });

  return true;
}



