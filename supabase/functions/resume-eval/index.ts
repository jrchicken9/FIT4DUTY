// A lightweight, versioned resume evaluation function.
// POST body: { profile: any, config?: any, configKey?: string }
// If config provided, use it; else try configKey, else fallback to 'application.resume.rules.v1'.
// Returns { totalPercent, level, details: Array<{ category, rawPoints, cappedPoints, maxPoints, matchedRuleIds: string[] }> }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type BinaryExpr = { var: string; op: string; value: unknown };
type Expr = BinaryExpr | { all?: Expr[] } | { any?: Expr[] } | { not?: Expr };

type Rule = {
  id: string;
  type: 'add' | 'anchor' | 'bonus' | 'disqualifier';
  points?: number;
  expr?: Expr;
};

type Category = { key: string; maxPoints: number; rules: Rule[] };

type Config = {
  version: string;
  categories: Record<string, Category> | Category[];
  thresholds: Array<{ level: string; min: number }>;
  categoryStages?: Record<string, Array<{ level: string; min: number }>>;
  disqualifiers?: Rule[]; // optional global disqualifiers
};

function get(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, k: string) => (acc == null ? undefined : acc[k]), obj);
}

function cmp(a: any, op: string, b: any): boolean {
  switch (op) {
    case '==': return a == b;
    case '!=': return a != b;
    case '>': return Number(a) > Number(b);
    case '>=': return Number(a) >= Number(b);
    case '<': return Number(a) < Number(b);
    case '<=': return Number(a) <= Number(b);
    case 'includes': {
      if (Array.isArray(a)) return a.includes(b);
      if (typeof a === 'string') return String(a).includes(String(b));
      return false;
    }
    default: return false;
  }
}

function evalExpr(expr: Expr | undefined, profile: any): boolean {
  if (!expr) return true;
  if ('all' in (expr as any)) return ((expr as any).all || []).every((e: Expr) => evalExpr(e, profile));
  if ('any' in (expr as any)) return ((expr as any).any || []).some((e: Expr) => evalExpr(e, profile));
  if ('not' in (expr as any)) return !evalExpr((expr as any).not, profile);
  const be = expr as BinaryExpr;
  const a = get(profile, be.var);
  return cmp(a, be.op, be.value);
}

function toCategoryArray(categories: Config['categories']): Category[] {
  if (Array.isArray(categories)) return categories as Category[];
  return Object.entries(categories as Record<string, Category>).map(([key, c]) => ({ key, ...c } as Category));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    });

    const body = await req.json().catch(() => ({}));
    const profile = body?.profile || {};
    let config: Config | null = body?.config || null;
    const contentKey = body?.configKey || 'application.resume.rules.v1';

    if (!config) {
      const { data, error } = await supabase.from('app_content_text').select('current_text').eq('content_key', contentKey).maybeSingle();
      if (error) throw error;
      if (data?.current_text) config = JSON.parse(data.current_text);
    }

    if (!config) return json({ error: 'No config found' }, 400);

    const categories = toCategoryArray(config.categories);
    const details: Array<{ category: string; rawPoints: number; cappedPoints: number; maxPoints: number; matchedRuleIds: string[] }> = [];

    // Check global disqualifiers first
    let disqualified = false;
    let disqId: string | undefined;
    for (const r of (config.disqualifiers || [])) {
      if (r.type === 'disqualifier' && evalExpr(r.expr, profile)) { disqualified = true; disqId = r.id; break; }
    }

    for (const cat of categories) {
      let raw = 0;
      const matched: string[] = [];
      for (const rule of (cat.rules || [])) {
        if (!evalExpr(rule.expr, profile)) continue;
        if (rule.type === 'add' || rule.type === 'bonus') {
          const pts = Number(rule.points || 0);
          if (pts > 0) { raw += pts; matched.push(rule.id); }
        } else if (rule.type === 'anchor') {
          matched.push(rule.id);
        }
      }
      const capped = Math.min(raw, Number(cat.maxPoints || 0));
      details.push({ category: cat.key, rawPoints: raw, cappedPoints: capped, maxPoints: Number(cat.maxPoints || 0), matchedRuleIds: matched });
    }

    const sum = details.reduce((s, d) => s + d.cappedPoints, 0);
    const max = details.reduce((s, d) => s + d.maxPoints, 0) || 1;
    const percent = Math.max(0, Math.min(100, Math.round((sum / max) * 100)));

    let level = 'NEEDS_WORK';
    const th = [...config.thresholds].sort((a, b) => b.min - a.min);
    const hit = th.find(t => percent >= t.min);
    if (hit) level = hit.level;
    if (disqualified) level = 'NEEDS_WORK';

    return json({ totalPercent: percent, level, details, disqualified, disqualifierId: disqId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}


