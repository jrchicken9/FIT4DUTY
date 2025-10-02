import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Info, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DEFAULT_COMPETITIVENESS_CONFIG as CFG } from '@/constants/competitivenessConfig';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ResumeGradingTooltip({ visible, onClose }: Props) {
  const cats = CFG.display.categoryOrder;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Info size={22} color={Colors.primary} />
            <Text style={styles.headerTitle}>How resume sections are graded</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {cats.map((key) => {
            const c = CFG.categories[key];
            return (
              <View key={key} style={styles.card}>
                <Text style={styles.cardTitle}>{c.displayName}</Text>
                <Text style={styles.hintText}>• {c.summaryHints.improve}</Text>
                <View style={styles.rulesWrap}>
                  {c.rules.map((r) => (
                    <Text key={r.id} style={styles.ruleText}>• {ruleLabel(key, r.id)}</Text>
                  ))}
                </View>
              </View>
            );
          })}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Disqualifiers (override)</Text>
            {(CFG.disqualifiers || []).map((d) => (
              <Text key={d.id} style={styles.ruleText}>• {disqLabel(d.id)}</Text>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ruleLabel(category: string, id: string): string {
  const labels: Record<string, Record<string, string>> = {
    education: {
      bachelor_relevant: 'Bachelor’s in a relevant field',
      diploma_police_foundations: '2‑year relevant diploma (e.g., Police Foundations)',
      any_post_secondary: 'Any post‑secondary credential',
      high_school_only: 'High school only',
      recent_grad_bonus: 'Recent graduation bonus (≤5 years)'
    },
    work: {
      relevant_3y_plus: '≥3 years in relevant roles (security, corrections, etc.)',
      relevant_1to2y: '1–2 years relevant',
      nonrel_leadership_3y_plus: '≥3 years non‑relevant with leadership',
      ft_1to2y: 'Any full‑time work 1–2 years',
      under_1y: '<1 year total'
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
      extra_relevant_cert: 'Additional relevant certifications'
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
      discipline_or_credit_trend: 'Employment discipline or poor credit trend'
    },
    softskills: {
      leadership_role: 'Clear leadership/coach/lead roles',
      customer_service_1y: 'Public‑facing roles ≥1 year'
    },
    references: {
      three_refs_mock_done: '3 solid references + mock interview completed',
      two_refs_or_some_prep: '2 references or some prep activities',
      minimal: 'Minimal references'
    }
  };
  return labels[category]?.[id] || id;
}

function disqLabel(id: string): string {
  const map: Record<string, string> = {
    criminal_open_or_recent_conviction: 'Open charges or recent disqualifying conviction → Not Eligible',
    dishonesty: 'Dishonesty admitted/verified → Not Eligible',
    recent_major_driving_offense: 'Recent major driving offense → Driving score set to 0 and flagged',
  };
  return map[id] || id;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: Colors.text },
  closeButton: { padding: 6 },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  hintText: { color: Colors.textSecondary, marginBottom: 6 },
  rulesWrap: { gap: 2 },
  ruleText: { color: Colors.text, fontSize: 14 },
});


