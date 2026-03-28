import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Building,
  User,
  MapPin,
  Users,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { PoliceService } from "@/types/lfiGrading";
import { supabase } from "@/lib/supabase";

interface PoliceServiceManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function PoliceServiceManager({ visible, onClose }: PoliceServiceManagerProps) {
  const [services, setServices] = useState<PoliceService[]>([]);
  const [editingService, setEditingService] = useState<PoliceService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [jurisdictionInput, setJurisdictionInput] = useState('');
  const [programInput, setProgramInput] = useState('');

  useEffect(() => {
    if (visible) {
      loadServices();
    }
  }, [visible]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('police_services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Error', 'Failed to load police services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service: PoliceService) => {
    setEditingService({ ...service });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingService) return;

    try {
      setIsLoading(true);
      
      if (editingService.id && services.find(s => s.id === editingService.id)) {
        // Update existing
        const { error } = await supabase
          .from('police_services')
          .update({
            name: editingService.name,
            lead_title: editingService.lead_title,
            lead_name: editingService.lead_name,
            lead_aliases: editingService.lead_aliases,
            divisions_count: editingService.divisions_count,
            jurisdiction_names: editingService.jurisdiction_names,
            programs_or_units: editingService.programs_or_units,
            valid_from: editingService.valid_from,
            valid_to: editingService.valid_to,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingService.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('police_services')
          .insert({
            id: editingService.id,
            name: editingService.name,
            lead_title: editingService.lead_title,
            lead_name: editingService.lead_name,
            lead_aliases: editingService.lead_aliases,
            divisions_count: editingService.divisions_count,
            jurisdiction_names: editingService.jurisdiction_names,
            programs_or_units: editingService.programs_or_units,
            valid_from: editingService.valid_from,
            valid_to: editingService.valid_to,
          });

        if (error) throw error;
      }

      await loadServices();
      setIsEditing(false);
      setEditingService(null);
      Alert.alert('Success', 'Service updated successfully');
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingService(null);
  };

  const addArrayItem = (field: keyof PoliceService, value: string) => {
    if (!editingService || !value.trim()) return;
    
    const currentArray = (editingService[field] as string[]) || [];
    setEditingService({
      ...editingService,
      [field]: [...currentArray, value.trim()]
    });
  };

  const removeArrayItem = (field: keyof PoliceService, index: number) => {
    if (!editingService) return;
    
    const currentArray = (editingService[field] as string[]) || [];
    setEditingService({
      ...editingService,
      [field]: currentArray.filter((_, i) => i !== index)
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Police Service Manager</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading services...</Text>
            </View>
          ) : (
            <>
              {services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.leadInfo}>
                        {service.lead_title}: {service.lead_name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleEdit(service)}
                      style={styles.editButton}
                    >
                      <Edit3 size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.serviceDetails}>
                    <View style={styles.detailRow}>
                      <Users size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {service.divisions_count || 'N/A'} divisions
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <MapPin size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {service.jurisdiction_names.length} jurisdictions
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Building size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {service.programs_or_units.length} programs/units
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {isEditing && editingService && (
                <View style={styles.editModal}>
                  <Text style={styles.editTitle}>Edit Service</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Service Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editingService.name}
                      onChangeText={(text) => setEditingService({ ...editingService, name: text })}
                      placeholder="Toronto Police Service"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Lead Title</Text>
                    <TextInput
                      style={styles.input}
                      value={editingService.lead_title}
                      onChangeText={(text) => setEditingService({ ...editingService, lead_title: text })}
                      placeholder="Chief of Police"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Lead Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editingService.lead_name}
                      onChangeText={(text) => setEditingService({ ...editingService, lead_name: text })}
                      placeholder="John Doe"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Divisions Count</Text>
                    <TextInput
                      style={styles.input}
                      value={editingService.divisions_count?.toString() || ''}
                      onChangeText={(text) => setEditingService({ 
                        ...editingService, 
                        divisions_count: text ? parseInt(text) : undefined 
                      })}
                      placeholder="17"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.arrayInputGroup}>
                    <Text style={styles.inputLabel}>Jurisdiction Names</Text>
                    {editingService.jurisdiction_names.map((name, index) => (
                      <View key={index} style={styles.arrayItem}>
                        <Text style={styles.arrayItemText}>{name}</Text>
                        <TouchableOpacity
                          onPress={() => removeArrayItem('jurisdiction_names', index)}
                          style={styles.removeButton}
                        >
                          <X size={16} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View style={styles.addItemRow}>
                      <TextInput
                        style={styles.addItemInput}
                        placeholder="Add jurisdiction name"
                        value={jurisdictionInput}
                        onChangeText={setJurisdictionInput}
                        onSubmitEditing={(e) => {
                          if (jurisdictionInput.trim()) {
                            addArrayItem('jurisdiction_names', jurisdictionInput.trim());
                            setJurisdictionInput('');
                          }
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          // This would need to be handled differently in a real implementation
                        }}
                        style={styles.addButton}
                      >
                        <Plus size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.arrayInputGroup}>
                    <Text style={styles.inputLabel}>Programs/Units</Text>
                    {editingService.programs_or_units.map((program, index) => (
                      <View key={index} style={styles.arrayItem}>
                        <Text style={styles.arrayItemText}>{program}</Text>
                        <TouchableOpacity
                          onPress={() => removeArrayItem('programs_or_units', index)}
                          style={styles.removeButton}
                        >
                          <X size={16} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View style={styles.addItemRow}>
                      <TextInput
                        style={styles.addItemInput}
                        placeholder="Add program/unit"
                        value={programInput}
                        onChangeText={setProgramInput}
                        onSubmitEditing={(e) => {
                          if (programInput.trim()) {
                            addArrayItem('programs_or_units', programInput.trim());
                            setProgramInput('');
                          }
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          // This would need to be handled differently in a real implementation
                        }}
                        style={styles.addButton}
                      >
                        <Plus size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.editActions}>
                    <Button
                      title="Cancel"
                      onPress={handleCancel}
                      variant="outline"
                      style={styles.actionButton}
                    />
                    <Button
                      title="Save"
                      onPress={handleSave}
                      style={styles.actionButton}
                      disabled={isLoading}
                    />
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  serviceCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadows.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  leadInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editButton: {
    padding: 8,
  },
  serviceDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editModal: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: Colors.shadows.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  arrayInputGroup: {
    marginBottom: 16,
  },
  arrayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  arrayItemText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  addButton: {
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
});
