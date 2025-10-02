import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AdminAction = 'list' | 'create' | 'update' | 'toggle' | 'issue' | 'revoke';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single();
    const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'super_admin';
    if (!isAdmin) return json({ error: 'Forbidden' }, 403);

    const { action, payload } = await req.json();
    switch (action as AdminAction) {
      case 'list': {
        const { data, error } = await supabaseAdmin.from('badges').select('*');
        if (error) throw error;
        return json({ data });
      }
      case 'create':
      case 'update': {
        const badge = payload?.badge;
        if (!badge) return json({ error: 'badge payload required' }, 400);
        const { data, error } = await supabaseAdmin.from('badges').upsert(badge).select('*');
        if (error) throw error;
        return json({ data });
      }
      case 'toggle': {
        const { id, active } = payload || {};
        if (!id) return json({ error: 'id required' }, 400);
        const { data, error } = await supabaseAdmin.from('badges').update({ active }).eq('id', id).select('*');
        if (error) throw error;
        return json({ data });
      }
      case 'issue': {
        const { user_identifier, badge_slug, note } = payload || {};
        if (!badge_slug || !user_identifier) return json({ error: 'user_identifier and badge_slug required' }, 400);
        const { data: badge } = await supabaseAdmin.from('badges').select('*').eq('slug', badge_slug).single();
        if (!badge) return json({ error: 'badge not found' }, 404);
        const { data: u } = await findUserByIdentifier(supabaseAdmin, user_identifier);
        if (!u) return json({ error: 'user not found' }, 404);

        const { error: upsertErr } = await supabaseAdmin.from('user_badges').upsert({
          user_id: u.id,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
          revoked_at: null,
          evidence: { source: 'admin', note },
          source: 'admin',
          notes: note || null,
        }, { onConflict: 'user_id,badge_id' });
        if (upsertErr) throw upsertErr;
        await supabaseAdmin.from('badge_events').insert({ user_id: u.id, badge_id: badge.id, event_type: 'issued', payload: { source: 'admin', admin_id: user.id, note } });
        return json({ success: true });
      }
      case 'revoke': {
        const { user_identifier, badge_slug, note } = payload || {};
        if (!badge_slug || !user_identifier) return json({ error: 'user_identifier and badge_slug required' }, 400);
        const { data: badge } = await supabaseAdmin.from('badges').select('*').eq('slug', badge_slug).single();
        if (!badge) return json({ error: 'badge not found' }, 404);
        const { data: u } = await findUserByIdentifier(supabaseAdmin, user_identifier);
        if (!u) return json({ error: 'user not found' }, 404);

        const { error: updErr } = await supabaseAdmin
          .from('user_badges')
          .update({ revoked_at: new Date().toISOString(), notes: note || null })
          .eq('user_id', u.id)
          .eq('badge_id', badge.id);
        if (updErr) throw updErr;
        await supabaseAdmin.from('badge_events').insert({ user_id: u.id, badge_id: badge.id, event_type: 'revoked', payload: { source: 'admin', admin_id: user.id, note } });
        return json({ success: true });
      }
      default:
        return json({ error: 'Unknown action' }, 400);
    }
  } catch (err) {
    console.error('admin-badges error', err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status });
}

async function findUserByIdentifier(supabase: any, identifier: string) {
  // Try by UUID id first
  if (identifier.match(/^[0-9a-f-]{36}$/i)) {
    const { data } = await supabase.from('profiles').select('id,email').eq('id', identifier).single();
    return { data };
  }
  // Fallback email
  const { data } = await supabase.from('profiles').select('id,email').eq('email', identifier).single();
  return { data };
}



