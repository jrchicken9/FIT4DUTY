import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AdminAction =
  | "list_categories"
  | "upsert_category"
  | "delete_category"
  | "list_rules"
  | "upsert_rule"
  | "delete_rule"
  | "get_thresholds"
  | "set_thresholds";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } },
    );

    const { data: auth } = await supabaseUser.auth.getUser();
    const user = auth?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    // Only super admins can edit benchmark registry (matches RLS policies)
    const { data: profile, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, is_admin")
      .eq("id", user.id)
      .single();
    if (profErr) throw profErr;
    const isSuperAdmin = profile?.role === "super_admin";
    if (!isSuperAdmin) return json({ error: "Forbidden" }, 403);

    const body = await safeJson(req);
    const action = body?.action as AdminAction;
    const payload = body?.payload || {};

    switch (action) {
      case "list_categories": {
        const { data, error } = await supabaseAdmin
          .from("benchmark_categories")
          .select("*")
          .order("key", { ascending: true });
        if (error) throw error;
        return json({ data });
      }
      case "upsert_category": {
        const cat = payload?.category;
        if (!cat || !cat.key || !cat.name) return json({ error: "category { key, name } required" }, 400);
        const { data, error } = await supabaseAdmin
          .from("benchmark_categories")
          .upsert({
            key: String(cat.key),
            name: String(cat.name),
            description: cat.description ?? null,
            is_unwritten: Boolean(cat.is_unwritten ?? false),
          })
          .select("*")
          .single();
        if (error) throw error;
        return json({ data });
      }
      case "delete_category": {
        const { key } = payload || {};
        if (!key) return json({ error: "key required" }, 400);
        // Will cascade delete rules (FK defined in SQL)
        const { error } = await supabaseAdmin
          .from("benchmark_categories")
          .delete()
          .eq("key", String(key));
        if (error) throw error;
        return json({ success: true });
      }
      case "list_rules": {
        const { category_key, service_id, active } = payload || {};
        let q = supabaseAdmin.from("benchmark_rules").select("*").order("category_key").order("rule_key");
        if (category_key) q = q.eq("category_key", String(category_key));
        if (service_id) q = q.eq("service_id", String(service_id));
        if (typeof active === "boolean") q = q.eq("active", active);
        const { data, error } = await q;
        if (error) throw error;
        return json({ data });
      }
      case "get_thresholds": {
        const { category_key } = payload || {};
        let q = supabaseAdmin.from('benchmark_thresholds').select('*');
        if (category_key) q = q.eq('category_key', String(category_key));
        const { data, error } = await q;
        if (error) throw error;
        return json({ data });
      }
      case "set_thresholds": {
        const { category_key, thresholds } = payload || {};
        if (!category_key || typeof thresholds !== 'object') return json({ error: 'category_key and thresholds required' }, 400);
        const { data, error } = await supabaseAdmin.from('benchmark_thresholds').upsert({
          category_key: String(category_key),
          thresholds,
          updated_at: new Date().toISOString(),
        }).select('*').single();
        if (error) throw error;
        return json({ data });
      }
      case "upsert_rule": {
        const rule = payload?.rule;
        if (!rule || !rule.category_key || !rule.rule_key) {
          return json({ error: "rule { category_key, rule_key } required" }, 400);
        }
        const up = {
          id: rule.id ?? undefined,
          category_key: String(rule.category_key),
          rule_key: String(rule.rule_key),
          description: rule.description ?? null,
          is_anchor: Boolean(rule.is_anchor ?? false),
          is_unwritten: Boolean(rule.is_unwritten ?? false),
          service_id: rule.service_id ?? null,
          active: typeof rule.active === "boolean" ? rule.active : true,
        };
        const { data, error } = await supabaseAdmin
          .from("benchmark_rules")
          .upsert(up, { onConflict: "id" })
          .select("*")
          .single();
        if (error) throw error;
        return json({ data });
      }
      case "delete_rule": {
        const { id, category_key, rule_key, service_id } = payload || {};
        if (!id && !(category_key && rule_key)) return json({ error: "id or (category_key, rule_key) required" }, 400);
        let q = supabaseAdmin.from("benchmark_rules").delete();
        if (id) q = q.eq("id", String(id));
        else {
          q = q.eq("category_key", String(category_key)).eq("rule_key", String(rule_key));
          if (service_id) q = q.eq("service_id", String(service_id)); else q = q.is("service_id", null);
        }
        const { error } = await q;
        if (error) throw error;
        return json({ success: true });
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    console.error("admin-benchmarks error", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });
}

async function safeJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return {} as any;
  }
}


