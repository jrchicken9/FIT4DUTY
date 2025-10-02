import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Platform, ScrollView, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { z } from 'zod';
import { X, ChevronDown, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export type EntryType = 'work' | 'education' | 'volunteer' | 'cert' | 'reference' | 'language' | 'skill' | 'award';

type Props = {
  visible: boolean;
  type: EntryType;
  initial?: any;
  onSave: (entry: any) => void;
  onClose: () => void;
};

export default function ResumeEntryModal({ visible, type, initial, onSave, onClose }: Props) {
  const [entry, setEntry] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formType, setFormType] = useState<EntryType>(type);

  useEffect(() => {
    setEntry(initial || {});
    setFormType(type);
    setErrors({});
  }, [initial, type, visible]);

  const set = (k: string, v: any) => setEntry((e: any) => ({ ...e, [k]: v }));

  // Validation schemas
  const monthYear = z.string().regex(/^\d{4}-\d{2}$/);
  const fullDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

  const educationSchema = z.object({
    institution: z.string().min(1),
    country: z.string().optional().or(z.literal('')),
    province: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    program: z.string().optional().or(z.literal('')),
    credential_level: z.enum(['High School','College Certificate','College Diploma (2‑year)','Advanced Diploma (3‑year)',"Bachelor’s",'Post‑Grad Certificate',"Master’s",'Other']),
    field_of_study: z.string().optional().or(z.literal('')),
    start_date: monthYear.optional(),
    end_date: monthYear.optional(),
    in_progress: z.boolean().optional(),
    honors: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  }).refine((v) => !v.end_date || !v.start_date || v.end_date >= v.start_date, { message: 'End date must be after start date' });

  const workSchema = z.object({
    employer: z.string().min(1),
    title: z.string().min(1),
    location: z.string().optional().or(z.literal('')),
    start_date: monthYear,
    end_date: monthYear.optional(),
    current: z.boolean().optional(),
    hours_per_week: z.coerce.number().min(0).max(168).optional(),
    role_type: z.enum(['Full‑time','Part‑time','Contract','Co‑op/Intern']).optional(),
    responsibilities: z.string().optional().or(z.literal('')),
    police_relevant: z.array(z.enum(['customer‑facing','conflict resolution','report writing','leadership','community outreach','shift work','first aid','security/public safety'])).optional(),
    supervisor: z.object({ name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional() }).partial().optional(),
  }).refine((v) => v.current || !!v.end_date, { message: 'Provide end date or mark as current' });

  const volunteerSchema = z.object({
    org: z.string().min(1),
    role: z.string().min(1),
    location: z.string().optional().or(z.literal('')),
    start_date: monthYear,
    end_date: monthYear.optional(),
    current: z.boolean().optional(),
    hours_per_week: z.coerce.number().min(0).max(168).optional(),
    total_hours: z.coerce.number().min(0).optional(),
    focus_areas: z.array(z.enum(['youth','seniors','vulnerable','community events','coaching/mentoring','emergency response'])).optional(),
    supervisor: z.object({ name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional() }).partial().optional(),
  }).refine((v) => v.hours_per_week != null || v.total_hours != null, { message: 'Provide hours/week or total hours' })
    .refine((v) => v.current || !!v.end_date, { message: 'Provide end date or mark as current' });

  const certSchema = z.object({
    name: z.string().min(1),
    issuer: z.string().min(1),
    type: z.enum(['cpr_c','mhfa','cpi_nvci','asist','naloxone','other']),
    type_custom: z.string().optional().or(z.literal('')),
    issue_date: fullDate,
    expiry_date: fullDate.optional(),
    credential_id: z.string().optional().or(z.literal('')),
    credential_url: z.string().url().optional().or(z.literal('')),
  });

  const languageSchema = z.object({
    language: z.string().min(1),
    proficiency: z.enum(['Basic','Conversational','Professional','Native']),
  });

  const skillSchema = z.object({
    name: z.string().min(1),
    proficiency: z.enum(['Basic','Intermediate','Advanced']),
    evidence: z.string().optional().or(z.literal('')),
  });

  const awardSchema = z.object({
    name: z.string().min(1),
    issuer: z.string().min(1),
    date: fullDate,
    description: z.string().optional().or(z.literal('')),
  });

  const referenceSchema = z.object({
    name: z.string().min(1),
    relationship: z.string().min(1),
    contact: z.string().min(1),
    known_2y: z.boolean().optional(),
  });

  const schemaMap: Record<EntryType, z.ZodTypeAny> = {
    education: educationSchema,
    work: workSchema,
    volunteer: volunteerSchema,
    cert: certSchema,
    language: languageSchema,
    skill: skillSchema,
    award: awardSchema,
    reference: referenceSchema,
  };

  const ymToDate = (s: string): Date | null => {
    if (!s || !/^\d{4}-\d{2}$/.test(s)) return null;
    const [y, m] = s.split('-').map((v) => parseInt(v, 10));
    if (!y || !m || m < 1 || m > 12) return null;
    return new Date(y, m - 1, 1);
  };

  const monthsBetween = (start: Date, end: Date): number => {
    return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
  };

  const save = () => {
    if (formType === 'work') {
      const sd = ymToDate(entry.start_date || '');
      const ed = ymToDate(entry.end_date || '') || new Date();
      if (sd) {
        entry.months = String(monthsBetween(sd, ed));
      }
    }
    const parsed = schemaMap[formType].safeParse(entry);
    if (!parsed.success) {
      const es: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const key = String(iss.path?.[0] ?? 'form');
        if (!es[key]) es[key] = iss.message;
      });
      setErrors(es);
      const first = parsed.error.issues?.[0];
      return alert(first?.message || 'Please check required fields');
    }
    // Preserve the id if we're editing an existing entry
    const saveData = { ...(parsed.data as any), __kind: formType };
    if (initial?.id !== undefined) {
      saveData.id = initial.id;
    }
    onSave(saveData);
  };

  const renderFields = () => {
    // For combined section UX: allow switching between item kinds
    const isCombined = ['cert','language','skill','award'].includes(formType as any);
    return (
      <>
        {isCombined && (
          <ChipGroup
            label="Item"
            options={[ 'Certification','Language','Skill','Award' ]}
            value={displayFromType(formType) || 'Certification'}
            onChange={(val) => setFormType(typeFromDisplay(val) as EntryType)}
          />
        )}
        {renderFieldsInner(formType)}
      </>
    );
  };

  const renderFieldsInner = (t: EntryType) => {
    switch (t) {
      case 'work':
        return (
          <>
            <Field label="Employer" value={entry.employer} onChange={(t) => set('employer', t)} />
            <Field label="Title" value={entry.title} onChange={(t) => set('title', t)} />
            <Field label="Location" value={entry.location} onChange={(t) => set('location', t)} />
            <MonthYearPickerRow label="Start date" value={entry.start_date} onChange={(s) => set('start_date', s)} />
            <MonthYearPickerRow label="End date" value={entry.end_date} onChange={(s) => set('end_date', s)} disabled={!!entry.current} />
            <Bool label="Current role" value={!!entry.current} onChange={(v) => set('current', v)} />
            <Field label="Hours per week" value={entry.hours_per_week?.toString()} onChange={(t) => set('hours_per_week', t)} keyboardType="number-pad" />
            <ChipGroup
              label="Role type"
              options={[ 'Full‑time','Part‑time','Contract','Co‑op/Intern' ]}
              value={entry.role_type || ''}
              onChange={(val) => set('role_type', val)}
            />
            <Field label="Responsibilities" value={entry.responsibilities} onChange={(t) => set('responsibilities', t)} />
            <MultiChipGroup
              label="Police-relevant"
              options={[ 'customer‑facing','conflict resolution','report writing','leadership','community outreach','shift work','first aid','security/public safety' ]}
              value={Array.isArray(entry.police_relevant) ? entry.police_relevant : []}
              onChange={(vals) => set('police_relevant', vals)}
            />
            <Field label="Supervisor Name (optional)" value={entry.supervisor?.name} onChange={(t) => set('supervisor', { ...(entry.supervisor || {}), name: t })} />
            <Field label="Supervisor Email (optional)" value={entry.supervisor?.email} onChange={(t) => set('supervisor', { ...(entry.supervisor || {}), email: t })} />
            <Field label="Supervisor Phone (optional)" value={entry.supervisor?.phone} onChange={(t) => set('supervisor', { ...(entry.supervisor || {}), phone: t })} />
          </>
        );
      case 'education':
        return (
          <>
            <Field label="Institution" value={entry.institution} onChange={(t) => set('institution', t)} />
            <Field label="Country (optional)" value={entry.country} onChange={(t) => set('country', t)} />
            <Field label="Province (optional)" value={entry.province} onChange={(t) => set('province', t)} />
            <Field label="City (optional)" value={entry.city} onChange={(t) => set('city', t)} />
            <Field label="Program/Major (optional)" value={entry.program} onChange={(t) => set('program', t)} />
            <ChipGroup
              label="Credential Level"
              options={[ 'High School','College Certificate','College Diploma (2‑year)','Advanced Diploma (3‑year)', "Bachelor’s", 'Post‑Grad Certificate', "Master’s", 'Other' ]}
              value={entry.credential_level || ''}
              onChange={(val) => set('credential_level', val)}
            />
            <Field label="Field of Study (optional)" value={entry.field_of_study} onChange={(t) => set('field_of_study', t)} />
            <MonthYearPickerRow label="Start date" value={entry.start_date} onChange={(s) => set('start_date', s)} />
            <MonthYearPickerRow label="End date" value={entry.end_date} onChange={(s) => set('end_date', s)} disabled={!!entry.in_progress} />
            <Bool label="In progress" value={!!entry.in_progress} onChange={(v) => set('in_progress', v)} />
            <Field label="Honors (optional)" value={entry.honors} onChange={(t) => set('honors', t)} />
            <Field label="Notes (optional)" value={entry.notes} onChange={(t) => set('notes', t)} />
          </>
        );
      case 'volunteer':
        return (
          <>
            <Field label="Organization" value={entry.org} onChange={(t) => set('org', t)} />
            <Field label="Role" value={entry.role} onChange={(t) => set('role', t)} />
            <Field label="Location (optional)" value={entry.location} onChange={(t) => set('location', t)} />
            <MonthYearPickerRow label="Start date" value={entry.start_date} onChange={(s) => set('start_date', s)} />
            <MonthYearPickerRow label="End date" value={entry.end_date} onChange={(s) => set('end_date', s)} disabled={!!entry.current} />
            <Bool label="Current" value={!!entry.current} onChange={(v) => set('current', v)} />
            <Field label="Hours per week" value={entry.hours_per_week?.toString()} onChange={(t) => set('hours_per_week', t)} keyboardType="number-pad" />
            <Field label="Total hours" value={entry.total_hours?.toString()} onChange={(t) => set('total_hours', t)} keyboardType="number-pad" />
            <Text style={{ color: Colors.textSecondary, marginBottom: 6 }}>* Provide either Hours per week or a Total hours estimate (required)</Text>
            <MultiChipGroup
              label="Focus areas"
              options={[ 'youth','seniors','vulnerable','community events','coaching/mentoring','emergency response' ]}
              value={Array.isArray(entry.focus_areas) ? entry.focus_areas : []}
              onChange={(vals) => set('focus_areas', vals)}
            />
            <Field label="Supervisor Name (optional)" value={entry.supervisor?.name} onChange={(t) => set('supervisor', { ...(entry.supervisor || {}), name: t })} />
            <Field label="Supervisor Email (optional)" value={entry.supervisor?.email} onChange={(t) => set('supervisor', { ...(entry.supervisor || {}), email: t })} />
            <Field label="Supervisor Phone (optional)" value={entry.supervisor?.phone} onChange={(t) => set('supervisor', { ...(entry.supervisor || {}), phone: t })} />
          </>
        );
      case 'cert':
        return (
          <>
            <Field label="Name" value={entry.name} onChange={(t) => set('name', t)} />
            <Field label="Issuer" value={entry.issuer} onChange={(t) => set('issuer', t)} />
            <ChipGroup
              label="Certification Type"
              options={[ 'CPR‑C/First Aid','Mental Health First Aid','CPI/NVCI','ASIST','Naloxone','Other' ]}
              value={displayFromType(entry.type) || ''}
              onChange={(val) => set('type', typeFromDisplay(val))}
            />
            {entry.type === 'other' && (
              <Field label="Type (custom)" value={entry.type_custom} onChange={(t) => set('type_custom', t)} />
            )}
            <DatePickerRow label="Issue date" value={entry.issue_date} onChange={(d) => set('issue_date', d)} />
            <DatePickerRow label="Expiry date (optional)" value={entry.expiry_date} onChange={(d) => set('expiry_date', d)} />
            <Field label="Credential ID (optional)" value={entry.credential_id} onChange={(t) => set('credential_id', t)} />
            <Field label="Credential URL (optional)" value={entry.credential_url} onChange={(t) => set('credential_url', t)} />
          </>
        );
      case 'reference':
        return (
          <>
            <Field label="Name" value={entry.name} onChange={(t) => set('name', t)} />
            <Field label="Relationship" value={entry.relationship} onChange={(t) => set('relationship', t)} />
            <Field label="Contact" value={entry.contact} onChange={(t) => set('contact', t)} />
            <Bool label="Known 2+ years" value={!!entry.known_2y} onChange={(v) => set('known_2y', v)} />
          </>
        );
      case 'language':
        return (
          <>
            <Field label="Language" value={entry.language} onChange={(t) => set('language', t)} />
            <ChipGroup
              label="Proficiency"
              options={[ 'Basic','Conversational','Professional','Native' ]}
              value={entry.proficiency || ''}
              onChange={(val) => set('proficiency', val)}
            />
          </>
        );
      case 'skill':
        return (
          <>
            <SkillPicker value={entry.name} onChange={(t) => set('name', t)} />
            <ChipGroup
              label="Proficiency"
              options={[ 'Basic','Intermediate','Advanced' ]}
              value={entry.proficiency || ''}
              onChange={(val) => set('proficiency', val)}
            />
            <Field label="Evidence (optional)" value={entry.evidence} onChange={(t) => set('evidence', t)} />
          </>
        );
      case 'award':
        return (
          <>
            <Field label="Name" value={entry.name} onChange={(t) => set('name', t)} />
            <Field label="Issuer" value={entry.issuer} onChange={(t) => set('issuer', t)} />
            <DatePickerRow label="Date" value={entry.date} onChange={(d) => set('date', d)} />
            <Field label="Description" value={entry.description} onChange={(t) => set('description', t)} />
          </>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>{titleFor(type)}</Text>
            <TouchableOpacity onPress={save} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.formContent}>
              {renderFields()}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={save} style={styles.saveButtonLarge}>
              <Text style={styles.saveButtonLargeText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Field({ label, value, onChange, keyboardType = 'default', editable = true }: { label: string; value?: string; onChange: (t: string) => void; keyboardType?: any; editable?: boolean }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput 
        style={[styles.fieldInput, !editable && styles.fieldInputDisabled]} 
        value={(value ?? '').toString()} 
        onChangeText={onChange} 
        keyboardType={keyboardType} 
        editable={editable}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={Colors.textTertiary}
      />
    </View>
  );
}

function Bool({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.switchContainer}>
        <Switch 
          value={!!value} 
          onValueChange={onChange}
          trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
          thumbColor={value ? Colors.primary : Colors.textSecondary}
        />
      </View>
    </View>
  );
}

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      {active && <Check size={12} color={Colors.primary} style={styles.chipCheck} />}
    </TouchableOpacity>
  );
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipsContainer}>
        {options.map(opt => (
          <Chip key={opt} label={opt} active={value === opt} onPress={() => onChange(opt)} />
        ))}
      </View>
    </View>
  );
}

function MultiChipGroup({ label, options, value, onChange, displayMap }: { label: string; options: string[]; value: string[]; onChange: (vals: string[]) => void; displayMap?: Record<string,string> }) {
  const toggle = (opt: string) => {
    const set = new Set(value || []);
    if (set.has(opt)) set.delete(opt); else set.add(opt);
    onChange(Array.from(set));
  };
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipsContainer}>
        {options.map(opt => {
          const active = (value || []).includes(opt);
          return (
            <Chip key={opt} label={displayMap?.[opt] || opt} active={active} onPress={() => toggle(opt)} />
          );
        })}
      </View>
    </View>
  );
}

const SKILL_SUGGESTIONS = [
  'Report writing', 'Customer service', 'Conflict de-escalation', 'Leadership', 'Team coordination',
  'Community outreach', 'Public speaking', 'First aid/CPR', 'Mental health support', 'Crisis intervention',
  'Active listening', 'Problem solving', 'Time management', 'Shift work reliability', 'Situational awareness',
  'Note taking', 'Computer literacy', 'Records management', 'Communication (verbal)', 'Communication (written)',
  'Evidence handling', 'Security operations', 'Surveillance', 'Risk assessment', 'Emergency response'
];

function SkillPicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value || '');
  const filtered = SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()));
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>Skill</Text>
      <TextInput
        style={styles.fieldInput}
        value={query}
        onChangeText={(t) => { setQuery(t); onChange(t); }}
        placeholder="Type to search skills"
        placeholderTextColor={Colors.textTertiary}
      />
      {query.length > 0 && (
        <View style={styles.skillSuggestionsContainer}>
          <ScrollView style={styles.skillSuggestions} showsVerticalScrollIndicator={false}>
            {filtered.map(s => (
              <TouchableOpacity 
                key={s} 
                onPress={() => { setQuery(s); onChange(s); }} 
                style={styles.skillItem}
              >
                <Text style={styles.skillText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function MonthYearPickerRow({ label, value, onChange, disabled }: { label: string; value?: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState<Date>(value ? new Date(value + '-01') : new Date());
  const displayLabel = value ? value : 'Select month';
  const open = () => {
    if (disabled) return;
    setTemp(value ? new Date(value + '-01') : new Date());
    setShow(true);
  };
  const commit = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    onChange(`${y}-${m}`);
    setShow(false);
  };
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity 
        disabled={disabled} 
        onPress={open} 
        style={[styles.datePickerButton, disabled && styles.datePickerButtonDisabled]}
      >
        <Text style={[styles.datePickerButtonText, disabled && styles.datePickerButtonTextDisabled]}>
          {displayLabel}
        </Text>
        <ChevronDown size={16} color={disabled ? Colors.textTertiary : Colors.textSecondary} />
      </TouchableOpacity>
      {show && (
        <>
          <DateTimePicker
            value={temp}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={Platform.OS === 'ios' ? 'light' : undefined}
            // @ts-ignore iOS only prop
            textColor={Colors.text}
            onChange={(e: any, d?: Date) => {
              if (Platform.OS === 'android') {
                if (e?.type === 'set' && d) commit(d);
                else setShow(false);
              } else if (d) {
                setTemp(d);
              }
            }}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.datePickerActions}>
              <TouchableOpacity onPress={() => setShow(false)} style={styles.datePickerActionButton}>
                <Text style={styles.datePickerActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => commit(temp)} style={[styles.datePickerActionButton, styles.datePickerActionButtonPrimary]}>
                <Text style={styles.datePickerActionTextPrimary}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function DatePickerRow({ label, value, onChange, disabled }: { label: string; value?: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState<Date>(value ? new Date(value) : new Date());
  const displayLabel = value ? value : 'Select date';
  const open = () => {
    if (disabled) return;
    setTemp(value ? new Date(value) : new Date());
    setShow(true);
  };
  const commit = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
    setShow(false);
  };
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity 
        disabled={disabled} 
        onPress={open} 
        style={[styles.datePickerButton, disabled && styles.datePickerButtonDisabled]}
      >
        <Text style={[styles.datePickerButtonText, disabled && styles.datePickerButtonTextDisabled]}>
          {displayLabel}
        </Text>
        <ChevronDown size={16} color={disabled ? Colors.textTertiary : Colors.textSecondary} />
      </TouchableOpacity>
      {show && (
        <>
          <DateTimePicker
            value={temp}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={Platform.OS === 'ios' ? 'light' : undefined}
            // @ts-ignore iOS only prop
            textColor={Colors.text}
            onChange={(e: any, d?: Date) => {
              if (Platform.OS === 'android') {
                if (e?.type === 'set' && d) commit(d);
                else setShow(false);
              } else if (d) {
                setTemp(d);
              }
            }}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.datePickerActions}>
              <TouchableOpacity onPress={() => setShow(false)} style={styles.datePickerActionButton}>
                <Text style={styles.datePickerActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => commit(temp)} style={[styles.datePickerActionButton, styles.datePickerActionButtonPrimary]}>
                <Text style={styles.datePickerActionTextPrimary}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function titleFor(type: EntryType): string {
  switch (type) {
    case 'work': return 'Add Job';
    case 'education': return 'Add Education';
    case 'volunteer': return 'Add Volunteer';
    case 'cert': return 'Add Certification';
    case 'reference': return 'Add Reference';
    case 'language': return 'Add Language';
    case 'skill': return 'Add Skill';
    case 'award': return 'Add Award';
  }
}

function displayFromType(t?: string) {
  switch (t) {
    case 'cpr_c': return 'CPR‑C/First Aid';
    case 'mhfa': return 'Mental Health First Aid';
    case 'cpi_nvci': return 'CPI/NVCI';
    case 'asist': return 'ASIST';
    case 'naloxone': return 'Naloxone';
    case 'other': return 'Other';
  }
  return '';
}

function typeFromDisplay(d: string) {
  const map: Record<string, string> = {
    'CPR‑C/First Aid': 'cpr_c',
    'Mental Health First Aid': 'mhfa',
    'CPI/NVCI': 'cpi_nvci',
    'ASIST': 'asist',
    'Naloxone': 'naloxone',
    'Other': 'other',
  };
  return map[d] || 'other';
}
const styles = StyleSheet.create({
  // Container and Layout
  container: { 
    flex: 1, 
    backgroundColor: Colors.white 
  },
  keyboardContainer: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Colors.white + '20',
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  
  // Form
  form: { 
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  formContent: {
    padding: 20,
  },
  
  // Field Components
  fieldContainer: { 
    marginBottom: 24,
  },
  fieldLabel: { 
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  fieldInput: { 
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    minHeight: 48,
  },
  fieldInputDisabled: {
    backgroundColor: Colors.gray[50],
    color: Colors.textTertiary,
  },
  
  // Switch
  switchContainer: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  
  // Chips
  chipsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8,
    marginTop: 4,
  },
  chip: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: { 
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  chipText: { 
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: { 
    color: Colors.primary, 
    fontWeight: '600' 
  },
  chipCheck: {
    marginLeft: 2,
  },
  
  // Skill Picker
  skillSuggestionsContainer: {
    marginTop: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skillSuggestions: {
    maxHeight: 200,
  },
  skillItem: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border,
  },
  skillText: { 
    color: Colors.text,
    fontSize: 16,
  },
  
  // Date Picker
  datePickerButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  datePickerButtonDisabled: {
    backgroundColor: Colors.gray[50],
    borderColor: Colors.gray[200],
  },
  datePickerButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  datePickerButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  datePickerActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
  },
  datePickerActionButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  datePickerActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  datePickerActionTextPrimary: {
    color: Colors.white,
  },
  
  // Footer
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButtonLarge: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonLargeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});


