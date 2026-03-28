import React from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, ScrollView, Alert, TextInput } from 'react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export type DrivingExtras = {
  // Driving & Record
  driver_licence_class?: string | null;
  driver_clean_abstract?: boolean | null;
  driver_abstract_date?: string | null;
  driver_infractions?: string | null;
  driver_infraction_date?: string | null; // Date of most recent infraction
  
  // Physical Readiness
  fitness_prep_observed_verified?: boolean | null;
  fitness_prep_digital_attempted?: boolean | null;
  fitness_prep_date?: string | null;
  fitness_shuttle_run?: string | null;
  fitness_circuit_time?: string | null;
  fitness_push_ups?: string | null;
  fitness_sit_ups?: string | null;
  
  // Background & Integrity
  conduct_no_major_issues?: boolean | null;
  background_check_complete?: boolean | null;
  credit_check_complete?: boolean | null;
  social_media_clean?: boolean | null;
  education_verified?: boolean | null;
  employment_verified?: boolean | null;
};

type Props = {
  visible: boolean;
  value: DrivingExtras;
  onSave: (next: DrivingExtras) => void;
  onClose: () => void;
};

export default function DrivingIndicatorsModal({ visible, value, onSave, onClose }: Props) {
  const [local, setLocal] = React.useState<DrivingExtras>(value || {});
  React.useEffect(() => { setLocal(value || {}); }, [value, visible]);

  const setField = (patch: Partial<DrivingExtras>) => setLocal(prev => ({ ...prev, ...patch }));

  const licenceOptions = ['G', 'G2', 'G1', 'OTHER'];
  const infractionOptions = ['None', '1 Minor', '2+ Minor', 'Major'];
  const prepLevels = Array.from({ length: 28 }, (_, i) => (i * 0.5 + 1).toFixed(1)); // 1.0 to 14.0 in 0.5 increments
  const circuitTimeOptions = ['2:30', '2:45', '3:00', '3:15', '3:30', '3:45', '4:00', '4:15', '4:30', '4:45', '5:00', '5:30', '6:00', 'Over 6:00'];

  const handleSave = () => {
    // Validate required fields
    if (!local.driver_licence_class) {
      Alert.alert('Required Field', 'Please select your licence class.');
      return;
    }
    
    // Save all comprehensive data for the enhanced grading system
    const comprehensiveData = {
      // Driving & Record
      driver_licence_class: local.driver_licence_class,
      driver_clean_abstract: local.driver_clean_abstract,
      driver_abstract_date: local.driver_abstract_date,
      driver_infractions: local.driver_infractions,
      driver_infraction_date: local.driver_infraction_date,
      
      // Physical Readiness
      fitness_prep_observed_verified: local.fitness_prep_observed_verified,
      fitness_prep_digital_attempted: local.fitness_prep_digital_attempted,
      fitness_prep_date: local.fitness_prep_date,
      fitness_shuttle_run: local.fitness_shuttle_run,
      fitness_circuit_time: local.fitness_circuit_time,
      fitness_push_ups: local.fitness_push_ups,
      fitness_sit_ups: local.fitness_sit_ups,
      
      // Background & Integrity
      conduct_no_major_issues: local.conduct_no_major_issues,
      background_check_complete: local.background_check_complete,
      credit_check_complete: local.credit_check_complete,
      social_media_clean: local.social_media_clean,
      education_verified: local.education_verified,
      employment_verified: local.employment_verified,
    };
    
    onSave(comprehensiveData);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: Colors.white, 
          borderTopLeftRadius: 16, 
          borderTopRightRadius: 16, 
          maxHeight: '90%',
          borderTopWidth: 1, 
          borderColor: Colors.border 
        }}>
          {/* Blue Header - extends to top of modal */}
          <View style={{ 
            backgroundColor: Colors.primary, 
            borderTopLeftRadius: 16, 
            borderTopRightRadius: 16,
            paddingHorizontal: 16, 
            paddingVertical: 16,
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.white }}>Driving & Indicators Assessment</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: Colors.white, fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
          
          {/* Content area with proper padding */}
          <View style={{ padding: 16 }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 4, backgroundColor: Colors.gray[200], borderRadius: 2 }} />
            </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '80%' }}>
            <View style={{ gap: 24 }}>
              
              {/* Driving & Record Section */}
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 }}>
                  🚗 Driving & Record
                </Text>
                
                <View style={{ gap: 12 }}>
                  <View>
                    <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 8 }}>Licence Class *</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {licenceOptions.map(opt => {
                        const active = (local.driver_licence_class || '').toUpperCase() === opt;
                        return (
                          <TouchableOpacity 
                            key={opt} 
                            onPress={() => setField({ driver_licence_class: opt })} 
                            style={[optionChipStyle, active && optionChipActiveStyle]}
                          >
                            <Text style={[optionChipTextStyle, active && optionChipTextActiveStyle]}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <RowSwitch 
                    label="Clean driving abstract (last 24 months)" 
                    value={!!local.driver_clean_abstract} 
                    onValueChange={(v) => setField({ driver_clean_abstract: v })} 
                  />

                  <View>
                    <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 8 }}>Recent Infractions</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {infractionOptions.map(opt => {
                        const active = local.driver_infractions === opt;
                        return (
                          <TouchableOpacity 
                            key={opt} 
                            onPress={() => setField({ driver_infractions: opt })} 
                            style={[optionChipStyle, active && optionChipActiveStyle]}
                          >
                            <Text style={[optionChipTextStyle, active && optionChipTextActiveStyle]}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    
                    {/* Infraction Date - only show if infractions exist */}
                    {local.driver_infractions && local.driver_infractions !== 'None' && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 6 }}>Date of Most Recent Infraction</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {['Within 6 months', '6-12 months ago', '1-2 years ago', '2-3 years ago', '3+ years ago'].map(period => {
                            const active = local.driver_infraction_date === period;
                            return (
                              <TouchableOpacity 
                                key={period} 
                                onPress={() => setField({ driver_infraction_date: period })} 
                                style={[optionChipStyle, active && optionChipActiveStyle]}
                              >
                                <Text style={[optionChipTextStyle, active && optionChipTextActiveStyle]}>{period}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Physical Readiness Section */}
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 }}>
                  💪 Physical Readiness
                </Text>
                
                <View style={{ gap: 12 }}>
                  <RowSwitch 
                    label="PREP/PIN observed & verified" 
                    value={!!local.fitness_prep_observed_verified} 
                    onValueChange={(v) => setField({ fitness_prep_observed_verified: v })} 
                  />
                  
                  <RowSwitch 
                    label="Digital/Practice fitness attempts" 
                    value={!!local.fitness_prep_digital_attempted} 
                    onValueChange={(v) => setField({ fitness_prep_digital_attempted: v })} 
                  />

                  <View>
                    <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 8 }}>PREP Shuttle Run Level</Text>
                    <Text style={{ color: Colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
                      Select your highest achieved level (1.0 = beginner, 14.0 = elite)
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {prepLevels.map(level => {
                        const active = local.fitness_shuttle_run === level;
                        const levelNum = parseFloat(level);
                        let chipStyle = optionChipStyle;
                        let textStyle = optionChipTextStyle;
                        
                        // Color coding based on PREP levels
                        if (levelNum >= 10.0) {
                          chipStyle = active ? { ...optionChipStyle, backgroundColor: '#10B981', borderColor: '#059669' } as any : { ...optionChipStyle, backgroundColor: '#D1FAE5' } as any;
                          textStyle = active ? { ...optionChipTextStyle, color: '#FFFFFF', fontWeight: '700' } as any : { ...optionChipTextStyle, color: '#065F46' } as any;
                        } else if (levelNum >= 7.0) {
                          chipStyle = active ? { ...optionChipStyle, backgroundColor: '#3B82F6', borderColor: '#2563EB' } as any : { ...optionChipStyle, backgroundColor: '#DBEAFE' } as any;
                          textStyle = active ? { ...optionChipTextStyle, color: '#FFFFFF', fontWeight: '700' } as any : { ...optionChipTextStyle, color: '#1E40AF' } as any;
                        } else if (levelNum >= 5.0) {
                          chipStyle = active ? { ...optionChipStyle, backgroundColor: '#F59E0B', borderColor: '#D97706' } as any : { ...optionChipStyle, backgroundColor: '#FEF3C7' } as any;
                          textStyle = active ? { ...optionChipTextStyle, color: '#FFFFFF', fontWeight: '700' } as any : { ...optionChipTextStyle, color: '#92400E' } as any;
                        }
                        
                        return (
                          <TouchableOpacity 
                            key={level} 
                            onPress={() => setField({ fitness_shuttle_run: level })} 
                            style={[chipStyle, active && optionChipActiveStyle]}
                          >
                            <Text style={[textStyle, active && optionChipTextActiveStyle]}>{level}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View>
                    <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 8 }}>PREP Circuit Time</Text>
                    <Text style={{ color: Colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
                      Select your best PREP circuit completion time
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {circuitTimeOptions.map(time => {
                        const active = local.fitness_circuit_time === time;
                        let chipStyle = optionChipStyle;
                        let textStyle = optionChipTextStyle;
                        
                        // Color coding based on circuit time performance
                        if (time === '2:30' || time === '2:45') {
                          chipStyle = active ? { ...optionChipStyle, backgroundColor: '#10B981', borderColor: '#059669' } as any : { ...optionChipStyle, backgroundColor: '#D1FAE5' } as any;
                          textStyle = active ? { ...optionChipTextStyle, color: '#FFFFFF', fontWeight: '700' } as any : { ...optionChipTextStyle, color: '#065F46' } as any;
                        } else if (time === '3:00' || time === '3:15') {
                          chipStyle = active ? { ...optionChipStyle, backgroundColor: '#3B82F6', borderColor: '#2563EB' } as any : { ...optionChipStyle, backgroundColor: '#DBEAFE' } as any;
                          textStyle = active ? { ...optionChipTextStyle, color: '#FFFFFF', fontWeight: '700' } as any : { ...optionChipTextStyle, color: '#1E40AF' } as any;
                        } else if (time === '3:30' || time === '3:45' || time === '4:00') {
                          chipStyle = active ? { ...optionChipStyle, backgroundColor: '#F59E0B', borderColor: '#D97706' } as any : { ...optionChipStyle, backgroundColor: '#FEF3C7' } as any;
                          textStyle = active ? { ...optionChipTextStyle, color: '#FFFFFF', fontWeight: '700' } as any : { ...optionChipTextStyle, color: '#92400E' } as any;
                        } else if (time === '4:15' || time === '4:30' || time === '4:45') {
                          chipStyle = active ? { ...optionChipStyle, backgroundColor: '#F97316', borderColor: '#EA580C' } as any : { ...optionChipStyle, backgroundColor: '#FED7AA' } as any;
                          textStyle = active ? { ...optionChipTextStyle, color: '#FFFFFF', fontWeight: '700' } as any : { ...optionChipTextStyle, color: '#C2410C' } as any;
                        } else {
                          chipStyle = active ? { ...optionChipStyle, backgroundColor: '#EF4444', borderColor: '#DC2626' } as any : { ...optionChipStyle, backgroundColor: '#FEE2E2' } as any;
                          textStyle = active ? { ...optionChipTextStyle, color: '#FFFFFF', fontWeight: '700' } as any : { ...optionChipTextStyle, color: '#991B1B' } as any;
                        }
                        
                        return (
                          <TouchableOpacity 
                            key={time} 
                            onPress={() => setField({ fitness_circuit_time: time })} 
                            style={[chipStyle, active && optionChipActiveStyle]}
                          >
                            <Text style={[textStyle, active && optionChipTextActiveStyle]}>{time}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

              {/* Background & Integrity Section */}
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 }}>
                  🔍 Background & Integrity
                </Text>
                
                <View style={{ gap: 12 }}>
                  <RowSwitch 
                    label="No major background issues" 
                    value={local.conduct_no_major_issues !== false} 
                    onValueChange={(v) => setField({ conduct_no_major_issues: v })} 
                  />
                  
                  <RowSwitch 
                    label="Background check completed" 
                    value={!!local.background_check_complete} 
                    onValueChange={(v) => setField({ background_check_complete: v })} 
                  />
                  
                  <RowSwitch 
                    label="Credit check completed" 
                    value={!!local.credit_check_complete} 
                    onValueChange={(v) => setField({ credit_check_complete: v })} 
                  />
                  
                  <RowSwitch 
                    label="Social media accounts clean" 
                    value={!!local.social_media_clean} 
                    onValueChange={(v) => setField({ social_media_clean: v })} 
                  />
                  
                  <RowSwitch 
                    label="Education verification complete" 
                    value={!!local.education_verified} 
                    onValueChange={(v) => setField({ education_verified: v })} 
                  />
                  
                  <RowSwitch 
                    label="Employment verification complete" 
                    value={!!local.employment_verified} 
                    onValueChange={(v) => setField({ employment_verified: v })} 
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: Colors.border }}>
            <Button title="Save Changes" onPress={handleSave} />
          </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function RowSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: Colors.text, flex: 1, marginRight: 12 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const optionChipStyle = { 
  paddingHorizontal: 12, 
  paddingVertical: 8, 
  borderRadius: 20, 
  borderWidth: 1, 
  borderColor: Colors.border, 
  backgroundColor: '#FFFFFF',
  minWidth: 60,
  alignItems: 'center'
} as const;

const optionChipActiveStyle = { 
  backgroundColor: '#EEF2FF', 
  borderColor: '#93C5FD' 
} as const;

const optionChipTextStyle = { 
  color: Colors.text,
  fontSize: 14,
  fontWeight: '500'
} as const;

const optionChipTextActiveStyle = { 
  color: '#1D4ED8', 
  fontWeight: '700' 
} as const;


