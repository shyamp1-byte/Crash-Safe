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
import type { CrashStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { saveStepData } from '../../../services/incidentService';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<CrashStackParamList, 'OtherDriverInfo'>;

interface Field {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
}

const FIELDS: Field[] = [
  { key: 'name', label: 'Full Name', placeholder: 'Jane Doe' },
  {
    key: 'phone',
    label: 'Phone Number',
    placeholder: '(555) 000-0000',
    keyboardType: 'phone-pad',
  },
  { key: 'license', label: "Driver's License #", placeholder: 'DL12345678' },
  { key: 'insurance', label: 'Insurance Company', placeholder: 'State Farm' },
  { key: 'policy', label: 'Policy Number', placeholder: 'POL-123456' },
  { key: 'plate', label: 'License Plate', placeholder: 'ABC 1234' },
  { key: 'make', label: 'Vehicle Make & Model', placeholder: 'Toyota Camry 2022' },
];

export default function OtherDriverInfo({ navigation }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { activeIncident, completeStep } = useIncidentStore();

  const handleNext = async () => {
    if (!activeIncident) return;
    setSaving(true);
    try {
      await saveStepData(activeIncident.id, 'other_driver_info', values);
      completeStep('other_driver_info');
    } finally {
      setSaving(false);
    }
    navigation.navigate('OtherVehiclePhotos');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Other Driver Info"
        step={4}
        total={10}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Collect other driver's information</Text>
        <Text style={styles.subheading}>
          You are entitled to this information by law. Be calm and polite.
        </Text>

        <View style={styles.form}>
          {FIELDS.map(field => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor={COLORS.textMuted}
                value={values[field.key] ?? ''}
                onChangeText={text =>
                  setValues(prev => ({ ...prev, [field.key]: text }))
                }
                keyboardType={field.keyboardType ?? 'default'}
                autoCapitalize="words"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('OtherVehiclePhotos')}
        >
          <Text style={styles.skipText}>Skip — couldn't get their info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, saving && styles.disabled]}
          onPress={handleNext}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.nextText}>Save & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  heading: {
    fontSize: FONT.heading,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: FONT.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  form: { gap: SPACING.md },
  fieldGroup: { gap: SPACING.xs },
  fieldLabel: {
    fontSize: FONT.label,
    fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT.body,
    color: COLORS.text,
  },
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
