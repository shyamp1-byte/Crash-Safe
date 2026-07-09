import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HitRunStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { saveStepData } from '../../../services/incidentService';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';
import { generateId } from '../../../utils/uuid';

type Props = NativeStackScreenProps<HitRunStackParamList, 'WitnessSearch'>;

interface Witness {
  id: string;
  name: string;
  phone: string;
  description: string;
}

export default function WitnessSearch({ navigation }: Props) {
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [saving, setSaving] = useState(false);
  const { activeIncident, completeStep } = useIncidentStore();

  const addWitness = () =>
    setWitnesses(prev => [
      ...prev,
      { id: generateId(), name: '', phone: '', description: '' },
    ]);

  const updateWitness = (id: string, field: keyof Witness, value: string) =>
    setWitnesses(prev =>
      prev.map(w => (w.id === id ? { ...w, [field]: value } : w)),
    );

  const removeWitness = (id: string) =>
    setWitnesses(prev => prev.filter(w => w.id !== id));

  const handleNext = async () => {
    if (!activeIncident) return;
    setSaving(true);
    try {
      await saveStepData(activeIncident.id, 'witness_search', { witnesses });
      completeStep('witness_search');
    } finally {
      setSaving(false);
    }
    navigation.navigate('PoliceReportGuidance');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Find Witnesses"
        step={5}
        total={9}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Did anyone see it happen?</Text>
        <Text style={styles.subheading}>
          Look for people nearby — pedestrians, other parked drivers, shop workers,
          or anyone who may have seen the vehicle that hit you.
        </Text>

        {witnesses.map((w, i) => (
          <View key={w.id} style={styles.witnessCard}>
            <View style={styles.witnessHeader}>
              <Text style={styles.witnessTitle}>Witness {i + 1}</Text>
              <TouchableOpacity onPress={() => removeWitness(w.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={COLORS.textMuted}
              value={w.name}
              onChangeText={v => updateWitness(w.id, 'name', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={COLORS.textMuted}
              value={w.phone}
              onChangeText={v => updateWitness(w.id, 'phone', v)}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What did they see? (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={w.description}
              onChangeText={v => updateWitness(w.id, 'description', v)}
              multiline
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addWitness}>
          <Text style={styles.addButtonText}>+ Add Witness</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('PoliceReportGuidance')}
        >
          <Text style={styles.skipText}>No witnesses found</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, saving && styles.disabled]}
          onPress={handleNext}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.nextText}>
              Save & Continue{witnesses.length > 0 ? ` (${witnesses.length})` : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.md },
  heading: { fontSize: FONT.heading, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  subheading: { fontSize: FONT.body, color: COLORS.textMuted, lineHeight: 22 },
  witnessCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  witnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  witnessTitle: { fontSize: FONT.body, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.text },
  removeText: { fontSize: FONT.label, color: COLORS.danger },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT.body,
    color: COLORS.text,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  addButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  addButtonText: { color: COLORS.primary, fontSize: FONT.body, fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  skipButton: { alignItems: 'center', paddingVertical: SPACING.sm },
  skipText: { color: COLORS.textMuted, fontSize: FONT.body },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  nextText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
