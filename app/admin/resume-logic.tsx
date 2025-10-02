import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/lib/contentService';
import { DEFAULT_COMPETITIVENESS_CONFIG } from '@/constants/competitivenessConfig';
import { ONTARIO_RESUME_EVAL_V1 } from '@/constants/ontarioResumeEvaluatorV1';
import { supabase } from '@/lib/supabase';

const CONTENT_KEY = 'application.competitiveness.config';

export default function ResumeLogicAdmin() {
  const { isSuperAdmin, user } = useAuth();
  const [jsonText, setJsonText] = useState<string>('');
  const [lastSavedText, setLastSavedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [usingDefault, setUsingDefault] = useState<boolean>(false);

  const prettyDefault = useMemo(() => JSON.stringify(DEFAULT_COMPETITIVENESS_CONFIG, null, 2), []);

  const load = async () => {
    setLoading(true);
    try {
      const text = await contentService.getContent(CONTENT_KEY);
      if (text && text.trim().length > 0) {
        // Validate JSON; if invalid, fall back to defaults
        try {
          JSON.parse(text);
          setJsonText(text);
          setLastSavedText(text);
          setUsingDefault(false);
        } catch {
          setJsonText(prettyDefault);
          setLastSavedText(prettyDefault);
          setUsingDefault(true);
        }
      } else {
        setJsonText(prettyDefault);
        setLastSavedText(prettyDefault);
        setUsingDefault(false);
      }
    } catch (e) {
      setJsonText(prettyDefault);
      setLastSavedText(prettyDefault);
      setUsingDefault(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const validateConfig = (obj: any): string | null => {
    if (!obj || typeof obj !== 'object') return 'Config must be a JSON object';
    if (!obj.categories || !(Array.isArray(obj.categories) || typeof obj.categories === 'object')) return 'Missing categories';
    if (!obj.thresholds || !Array.isArray(obj.thresholds)) return 'Missing thresholds array';
    // display tokens optional for evaluator configs
    return null;
  };

  const save = async () => {
    if (!isSuperAdmin()) {
      Alert.alert('Access denied', 'Super admin only');
      return;
    }
    try {
      // Validate JSON
      let parsed: any;
      try {
        parsed = JSON.parse(jsonText);
      } catch (e: any) {
        Alert.alert('Invalid JSON', e?.message || 'Failed to parse JSON');
        return;
      }
      const err = validateConfig(parsed);
      if (err) {
        Alert.alert('Invalid Config', err);
        return;
      }
      setSaving(true);
      const payload = JSON.stringify(parsed, null, 2);
      const res = await contentService.updateContent(CONTENT_KEY, payload, user?.id || 'system', 'Updated resume competitiveness config');
      if (!res.success) throw new Error(res.error || 'Failed to save');
      setLastSavedText(payload);
      Alert.alert('Saved', 'Resume logic updated. Users will see new grading immediately.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    Alert.alert('Reset to Defaults', 'Replace the current config with the Ontario v1 evaluator defaults?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setJsonText(JSON.stringify(ONTARIO_RESUME_EVAL_V1, null, 2)) }
    ]);
  };

  // Quick editors (lightweight helpers that edit JSON safely)
  const setCategoryWeight = (category: string, weight: number) => {
    try {
      const obj = JSON.parse(jsonText);
      if (Array.isArray(obj.categories)) {
        const idx = (obj.categories as any[]).findIndex((c: any) => c.key === category);
        if (idx < 0) return;
        (obj.categories as any[])[idx].maxPoints = weight;
      } else {
        if (!obj.categories[category]) return;
        obj.categories[category].weight = weight;
      }
      setJsonText(JSON.stringify(obj, null, 2));
    } catch {}
  };

  const quickWeights = useMemo(() => {
    try {
      const obj = JSON.parse(jsonText || '{}');
      if (Array.isArray(obj.categories)) {
        return (obj.categories as any[]).map((c: any) => ({ key: c.key, weight: Number(c.maxPoints || 0) }));
      }
      const cats = obj.categories || {};
      return Object.keys(cats).map((k) => ({ key: k, weight: Number(cats[k]?.weight ?? 0) }));
    } catch {
      return [] as Array<{ key: string; weight: number }>;
    }
  }, [jsonText]);

  // Helpers for rule friendly labels per category
  const ruleFriendly: Record<string, Record<string, string>> = {
    education: {
      bachelor_relevant: "Bachelor’s in a relevant field",
      diploma_police_foundations: '2‑year relevant diploma (e.g., Police Foundations)',
      any_post_secondary: 'Any post‑secondary credential',
      extra_post_secondary: 'Additional post‑secondary credentials (stackable)',
      high_school_only: 'High school only',
      recent_grad_bonus: 'Recent graduation bonus (≤5 years)',
      cont_ed_recent_24m: 'Recent continuing education (≤24 months)'
    },
    work: {
      relevant_3y_plus: '≥3 years in relevant roles (security, corrections, etc.)',
      relevant_1to2y: '1–2 years relevant',
      nonrel_leadership_3y_plus: '≥3 years non‑relevant with leadership',
      ft_2y_plus: 'Any full‑time work ≥2 years',
      ft_1to2y: 'Any full‑time work 1–2 years',
      under_1y: '<1 year total',
      public_facing_history: 'Public‑facing work history',
      shift_exposure: 'Shift work exposure',
      continuity_no_gaps_6mo: 'Continuity (approx, limited gaps)'
    },
    volunteer: {
      committed_8h_12m: '≥8 hrs/month for ≥12 months with responsibility',
      steady_4h_6m: '≥4 hrs/month for ≥6 months',
      occasional: 'Occasional/short term'
    },
    certs: {
      cpr_c_current: 'First Aid/CPR‑C (current)',
      mh_first_aid: 'Mental Health First Aid',
      deescalation: 'De‑escalation/Conflict Management',
      extra_relevant_cert: 'Additional relevant certifications (stackable)',
      naloxone_trained: 'Naloxone trained',
      credential_recent_24m: 'Certification within last 24 months'
    },
    fitness: {
      prep_pass_6m: 'PREP/PIN passed (verified) in last 6 months',
      strong_indicators: 'Strong indicators (e.g., shuttle, plank)',
      average_indicators: 'Average indicators',
      below_avg_or_unknown: 'Below average or unknown'
    },
    driving: {
      full_license_clean_24m: 'Full G/G2 + clean abstract (24 mo)',
      one_minor_infraction: 'Minor infraction (≤1)',
      multi_minor: 'Multiple minor infractions'
    },
    background: {
      clean_all: 'Clean background',
      minor_credit: 'Minor credit issues, managed',
      discipline_or_credit_trend: 'Employment discipline or poor credit trend',
      social_media_ack: 'Social media acknowledgement'
    },
    softskills: {
      leadership_role: 'Leadership / coach / lead roles',
      customer_service_1y: 'Public‑facing roles ≥1 year',
      second_language_proficient: 'Second language (proficient)',
      skills_two_plus: 'Two or more skills'
    },
    references: {
      three_refs_mock_done: '3 solid references + mock interview completed',
      two_refs_or_some_prep: '2 references or some prep activities',
      minimal: 'Minimal references',
      tenure_two_refs_2y: '≥2 references know candidate 2+ years'
    }
  };

  // Safe parsed object for UI
  const parsed = useMemo(() => {
    try {
      return JSON.parse(jsonText || '{}');
    } catch {
      return {};
    }
  }, [jsonText]);

  const categoryOrder: string[] = useMemo(() => {
    if (Array.isArray(parsed?.categories)) {
      return (parsed.categories as any[]).map((c: any) => c.key);
    }
    return Array.isArray(parsed?.display?.categoryOrder) ? parsed.display.categoryOrder : Object.keys(parsed?.categories || {});
  }, [parsed]);

  const getCategoryByKey = (cfg: any, key: string) => {
    if (Array.isArray(cfg?.categories)) return (cfg.categories as any[]).find((c: any) => c.key === key);
    return cfg?.categories?.[key];
  };

  const updateRule = (categoryKey: string, ruleIndex: number, patch: Partial<{ points: number; repeatable: boolean; cap?: number }>) => {
    try {
      const obj = JSON.parse(jsonText || '{}');
      let rules: any[] | undefined;
      if (Array.isArray(obj.categories)) {
        const idx = (obj.categories as any[]).findIndex((c: any) => c.key === categoryKey);
        if (idx < 0) return;
        rules = (obj.categories as any[])[idx].rules;
      } else {
        if (!obj.categories?.[categoryKey]?.rules) return;
        rules = obj.categories[categoryKey].rules;
      }
      if (!Array.isArray(rules)) return;
      const nextRule = { ...rules[ruleIndex], ...patch };
      // Normalize numeric fields
      if (typeof nextRule.points === 'string') nextRule.points = parseInt(nextRule.points as unknown as string, 10) || 0;
      if (typeof nextRule.cap === 'string') nextRule.cap = parseInt(nextRule.cap as unknown as string, 10) || 0;
      rules[ruleIndex] = nextRule;
      if (Array.isArray(obj.categories)) {
        const idx = (obj.categories as any[]).findIndex((c: any) => c.key === categoryKey);
        (obj.categories as any[])[idx].rules = rules;
      } else {
        obj.categories[categoryKey].rules = rules;
      }
      setJsonText(JSON.stringify(obj, null, 2));
    } catch {}
  };

  const updateRuleExpr = (categoryKey: string, ruleIndex: number, field: 'var' | 'op' | 'value', value: any) => {
    try {
      const obj = JSON.parse(jsonText || '{}');
      let rules: any[] | undefined;
      if (Array.isArray(obj.categories)) {
        const idx = (obj.categories as any[]).findIndex((c: any) => c.key === categoryKey);
        if (idx < 0) return;
        rules = (obj.categories as any[])[idx].rules;
      } else {
        if (!obj.categories?.[categoryKey]?.rules) return;
        rules = obj.categories[categoryKey].rules;
      }
      if (!Array.isArray(rules)) return;
      const rule = { ...rules[ruleIndex] };
      const expr = { ...(rule.expr || {}) } as any;
      expr[field] = value;
      rule.expr = expr;
      rules[ruleIndex] = rule;
      if (Array.isArray(obj.categories)) {
        const idx = (obj.categories as any[]).findIndex((c: any) => c.key === categoryKey);
        (obj.categories as any[])[idx].rules = rules;
      } else {
        obj.categories[categoryKey].rules = rules;
      }
      setJsonText(JSON.stringify(obj, null, 2));
    } catch {}
  };
  const RuleRow = ({ categoryKey, rule, index }: { categoryKey: string; rule: any; index: number }) => {
    const friendly = ruleFriendly[categoryKey]?.[rule.id] || rule.id;
    return (
      <LinearGradient
        colors={[ '#FFFFFF', '#F8FAFC' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ruleGradient}
      >
        <View style={styles.ruleRow}>
          {/* Header: Rule label and ID pill */}
          <View style={styles.ruleHeader}>
            <Text style={styles.ruleLabel}>{friendly}</Text>
            <View style={styles.ruleIdPill}><Text style={styles.ruleIdPillText}>{rule.id}</Text></View>
          </View>
          {/* Body: Controls laid out responsively */}
          <View style={styles.ruleBody}>
            <View style={styles.pointsColumn}>
              <Text style={styles.inputLabel}>Points</Text>
              <TextInput
                style={[styles.input]}
                keyboardType="number-pad"
                value={String(rule.points ?? 0)}
                onChangeText={(t) => updateRule(categoryKey, index, { points: parseInt(t.replace(/[^0-9]/g, ''), 10) || 0 })}
              />
              <Text style={[styles.inputLabel, { marginTop: 8 }]}>Cap (per rule)</Text>
              <TextInput
                style={[styles.input]}
                keyboardType="number-pad"
                placeholder="cap"
                value={rule.cap != null ? String(rule.cap) : ''}
                onChangeText={(t) => updateRule(categoryKey, index, { cap: t === '' ? undefined : (parseInt(t.replace(/[^0-9]/g, ''), 10) || 0) })}
              />
            </View>
            <View style={styles.flagsColumn}>
              <View style={styles.flagRow}>
                <Text style={styles.flagLabel}>Repeatable</Text>
                <Switch value={!!rule.repeatable} onValueChange={(v) => updateRule(categoryKey, index, { repeatable: v })} />
              </View>
              <View style={{ height: 8 }} />
              <Text style={[styles.inputLabel, { marginBottom: 6 }]}>Condition (optional)</Text>
              <View style={styles.condRow}>
                <TextInput
                  style={[styles.input, styles.condVar]}
                  placeholder="metric (e.g., work.policeRelatedYears)"
                  value={String((rule as any)?.expr?.var || '')}
                  onChangeText={(t) => updateRuleExpr(categoryKey, index, 'var', t)}
                />
              </View>
              <View style={styles.condRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['>=','>','==','!=','<','<=','includes'].map(op => (
                    <TouchableOpacity key={op} onPress={() => updateRuleExpr(categoryKey, index, 'op', op)} style={[styles.opChip, ((rule as any)?.expr?.op||'')===op && styles.opChipActive]}>
                      <Text style={[styles.opChipText, ((rule as any)?.expr?.op||'')===op && styles.opChipTextActive]}>{op}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.condRow}>
                <TextInput
                  style={[styles.input, styles.condVal]}
                  placeholder="value"
                  value={(rule as any)?.expr?.value != null ? String((rule as any).expr.value) : ''}
                  onChangeText={(t) => updateRuleExpr(categoryKey, index, 'value', t)}
                />
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const dirty = useMemo(() => jsonText !== lastSavedText, [jsonText, lastSavedText]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Resume Logic & Grading</Text>
        <Text style={styles.sub}>Edit the JSON config that powers Build Your Profile sections and overall grading.</Text>
        {usingDefault && (
          <View style={styles.bannerWarning}>
            <Text style={styles.bannerText}>Loaded default config because stored config was invalid JSON. Fix and Save to overwrite.</Text>
          </View>
        )}

        {/* Quick Weights Editor */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Category Weights (Ontario v1)</Text>
          <Text style={styles.hint}>Adjust weights (0..100 scale internally sums then normalized). Changes write back into the JSON below.</Text>
          <View style={{ marginTop: 8, gap: 8 }}>
            {quickWeights.map((row) => (
              <View key={row.key} style={styles.row}> 
                <Text style={styles.rowLabel}>{row.key}</Text>
                <TextInput
                  style={[styles.input, { maxWidth: 120 }]}
                  keyboardType="number-pad"
                  value={String(row.weight)}
                  onChangeText={(t) => setCategoryWeight(row.key, parseInt(t.replace(/[^0-9]/g, ''), 10) || 0)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Rule Weights Editor */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rule Weights per Section</Text>
          <Text style={styles.hint}>
            Each section has rules that accumulate points up to the section’s weight. Edit rule points and caps to tune how entries in that section contribute to the score.
          </Text>
          <Text style={[styles.hint, { marginTop: 6 }]}>Tip: “Repeatable” rules can stack (capped by “cap”).</Text>
          <View style={{ marginTop: 12, gap: 12 }}>
            {categoryOrder.map((catKey) => {
              const cat = parsed?.categories?.[catKey];
              if (!cat || !Array.isArray(cat.rules)) return null;
              return (
                <LinearGradient
                  key={catKey}
                  colors={[ '#EEF2FF', '#ECFEFF', '#ECFDF5' ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryBlockInner}>
                    <Text style={styles.categoryTitle}>{cat.displayName || catKey}</Text>
                    <View style={{ gap: 10 }}>
                      {cat.rules.map((r: any, idx: number) => (
                        <RuleRow key={`${r.id}-${idx}`} categoryKey={catKey} rule={r} index={idx} />
                      ))}
                    </View>
                  </View>
                </LinearGradient>
              );
            })}
          </View>
        </View>

        {/* JSON Editor */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Config JSON</Text>
          <TextInput
            style={styles.textarea}
            value={jsonText}
            onChangeText={setJsonText}
            multiline
            numberOfLines={24}
            placeholder="Paste or edit CompetitivenessConfig JSON here"
            placeholderTextColor={Colors.textSecondary}
          />
          <View style={styles.actionsRow}>
            <Button title={loading ? 'Reloading…' : 'Reload'} onPress={load} variant="outline" />
            <Button title="Reset to Defaults" onPress={resetToDefault} variant="outline" />
            <Button title={saving ? 'Saving…' : 'Save'} onPress={save} />
          </View>
        </View>

        {/* Help */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.noteText}>- categories: per-section weights and rules ids used by the evaluator.</Text>
          <Text style={styles.noteText}>- thresholds: total score breakpoints mapped to levels (0..100).</Text>
          <Text style={styles.noteText}>- categoryStages: optional per-category stage thresholds for badges.</Text>
          <Text style={styles.noteText}>- disqualifiers: hard gates applied before mapping (e.g., setting to NEEDS_WORK).</Text>
        </View>
      </ScrollView>

      {/* Floating Save CTA */}
      <View style={styles.floatingBar} pointerEvents="box-none">
        <View style={styles.floatingInner}>
          <Button title={saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'} onPress={save} disabled={!dirty || saving} />
          <View style={{ height: 8 }} />
          <Button
            title="Preview with sample profile"
            variant="outline"
            onPress={async () => {
              try {
                const current = JSON.parse(jsonText);
                // Map current UI config (legacy) to evaluator config shape if needed
                const toEvaluatorConfig = (cfg: any) => {
                  if (Array.isArray(cfg?.categories)) return cfg; // already evaluator shape
                  const cats = cfg?.categories || {};
                  const categories = Object.keys(cats).map((key) => ({
                    key,
                    maxPoints: Number(cats[key]?.weight || 0),
                    // Map each rule to an unconditional add rule for preview (no DSL yet)
                    rules: (cats[key]?.rules || []).map((r: any) => ({ id: String(r.id || key + '_r'), type: 'add', points: Number(r.points || 0) }))
                  }));
                  const thresholds = (cfg?.thresholds || []).map((t: any) => ({ level: t.level, min: Number(t.min || 0) }));
                  return { version: 'preview', categories, thresholds };
                };
                const evalConfig = toEvaluatorConfig(current);
                const sampleProfile = { work: { policeRelatedYears: 2, fullTimeYears: 2 }, volunteer: { last12MonthsHours: 60 }, certs: [{ type: 'cpr_c' }] };
                const { data, error } = await supabase.functions.invoke('resume-eval', { body: { profile: sampleProfile, config: evalConfig } });
                if (error) throw error;
                if (!data) throw new Error('No data');
                const lvl = data.level ?? '—';
                const pct = typeof data.totalPercent === 'number' ? data.totalPercent : '—';
                Alert.alert('Preview', `Level: ${lvl}\nScore: ${pct}%`);
              } catch (e: any) {
                Alert.alert('Preview failed', e?.message || 'Error running preview');
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  sub: { color: Colors.textSecondary, marginTop: 4, marginBottom: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  hint: { color: Colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { width: 180, color: Colors.text },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 8, color: Colors.text, minHeight: 40 },
  textarea: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, minHeight: 320, padding: 12, color: Colors.text, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) as any },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  noteText: { color: Colors.textSecondary, marginTop: 4 },
  categoryGradient: { borderRadius: 16, padding: 1, marginTop: 16, shadowColor: '#000000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  categoryBlockInner: { backgroundColor: Colors.white, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: Colors.border },
  categoryTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  ruleGradient: { borderRadius: 12, padding: 1 },
  ruleRow: { backgroundColor: Colors.white, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  ruleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ruleLabel: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  ruleIdPill: { backgroundColor: Colors.gray ? (Colors.gray[100] || '#F1F5F9') : '#F1F5F9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  ruleIdPillText: { color: Colors.textSecondary, fontSize: 12 },
  ruleBody: { flexDirection: 'row', gap: 12 },
  pointsColumn: { flex: 1, minWidth: 140 },
  flagsColumn: { minWidth: 160, flex: 1, gap: 8 },
  inputLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
  ruleFlags: { minWidth: 180, gap: 6 },
  flagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  flagLabel: { color: Colors.text },
  bannerWarning: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 8 },
  bannerText: { color: '#92400E' },
  floatingBar: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  floatingInner: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  condRow: { marginBottom: 8 },
  condVar: { flex: 1 },
  condVal: { flex: 1 },
  opChip: { backgroundColor: Colors.gray ? (Colors.gray[100] || '#F1F5F9') : '#F1F5F9', borderWidth: 1, borderColor: Colors.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  opChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  opChipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  opChipTextActive: { color: Colors.white, fontWeight: '700' },
});


