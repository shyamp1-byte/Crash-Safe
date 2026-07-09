import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { VandalismStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { saveStepData } from '../../../services/incidentService';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<VandalismStackParamList, 'PoliceReport'>;

const TIPS = [
  { icon: '📞', text: 'Call non-emergency police line (not 911) unless crime is in progress' },
  { icon: '📋', text: 'Request a copy of the report — you\'ll need the report number for your insurance claim' },
  { icon: '📸', text: 'Show officers your photos to include in the report' },
  { icon: '🔍', text: 'Mention any witnesses, security cameras, or other evidence you found' },
  { icon: '📄', text: 'Ask for the officer\'s badge number and name for your records' },
];

export default function PoliceReport({ navigation }: Props) {
  const [reportNumber, setReportNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const { activeIncident, completeStep } = useIncidentStore();

  const handleNext = async () => {
    if (!activeIncident) return;
    setSaving(true);
    try {
      await saveStepData(activeIncident.id, 'police_report', { reportNumber });
      completeStep('police_report');
    } finally { setSaving(false); }
    navigation.navigate('InsuranceGuidance');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader title="Police Report" step={5} total={8} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>File a police report</Text>
          <Text style={styles.subheading}>
            Most insurance companies require a police report for vandalism claims. File one before making repairs.
          </Text>

          <View style={styles.list}>
            {TIPS.map((t, i) => (
              <View key={i} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{t.icon}</Text>
                <Text style={styles.tipText}>{t.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Police Report Number (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2024-12345"
              placeholderTextColor={COLORS.textMuted}
              value={reportNumber}
              onChangeText={setReportNumber}
              autoCapitalize="characters"
            />
            <Text style={styles.fieldHint}>Enter this now or add it later from Incident History.</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('InsuranceGuidance')}>
            <Text style={styles.skipText}>Skip — I'll add the report number later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, saving && styles.disabled]}
            onPress={handleNext}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextText}>Continue</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.lg },
  heading: { fontSize: FONT.heading, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  subheading: { fontSize: FONT.body, color: COLORS.textMuted, lineHeight: 22 },
  list: { gap: SPACING.sm },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, gap: SPACING.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  tipIcon: { fontSize: 20, marginTop: 1 },
  tipText: { flex: 1, fontSize: FONT.body, color: COLORS.text, lineHeight: 22 },
  fieldGroup: { gap: SPACING.xs },
  fieldLabel: { fontSize: FONT.label, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.md,
    fontSize: FONT.body, color: COLORS.text,
  },
  fieldHint: { fontSize: FONT.label, color: COLORS.textMuted },
  footer: {
    padding: SPACING.lg, paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm,
  },
  skipButton: { alignItems: 'center', paddingVertical: SPACING.sm },
  skipText: { color: COLORS.textMuted, fontSize: FONT.body },
  nextButton: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  nextText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
