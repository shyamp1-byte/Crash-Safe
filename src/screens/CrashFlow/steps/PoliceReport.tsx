import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CrashStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { saveStepData } from '../../../services/incidentService';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<CrashStackParamList, 'PoliceReport'>;

export default function PoliceReport({ navigation }: Props) {
  const [policeCalled, setPoliceCalled] = useState(false);
  const [reportNumber, setReportNumber] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [officerBadge, setOfficerBadge] = useState('');
  const [saving, setSaving] = useState(false);
  const { activeIncident, completeStep } = useIncidentStore();

  const handleNext = async () => {
    if (!activeIncident) return;
    setSaving(true);
    try {
      await saveStepData(activeIncident.id, 'police_report', {
        policeCalled,
        reportNumber,
        officerName,
        officerBadge,
      });
      completeStep('police_report');
    } finally {
      setSaving(false);
    }
    navigation.navigate('WhatNotToDo');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Police Report"
        step={7}
        total={10}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Was police involved?</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Police were called / arrived</Text>
          <Switch
            value={policeCalled}
            onValueChange={setPoliceCalled}
            trackColor={{ true: COLORS.primary, false: COLORS.border }}
            thumbColor="#FFF"
          />
        </View>

        {policeCalled && (
          <View style={styles.form}>
            <View style={styles.laterNote}>
              <Text style={styles.laterText}>
                💡 Don't have the report number yet? That's fine — fill in what you know now and add the rest from Incident History once the report is issued.
              </Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Report Number <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. RPT-2026-001234"
                placeholderTextColor={COLORS.textMuted}
                value={reportNumber}
                onChangeText={setReportNumber}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Officer Name <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Officer J. Smith"
                placeholderTextColor={COLORS.textMuted}
                value={officerName}
                onChangeText={setOfficerName}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Badge / Unit Number <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Badge #4521"
                placeholderTextColor={COLORS.textMuted}
                value={officerBadge}
                onChangeText={setOfficerBadge}
              />
            </View>
          </View>
        )}

        {!policeCalled && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📋 Should you call?</Text>
            <Text style={styles.infoText}>
              File a police report for any crash involving injury, significant
              damage, disputed fault, or an uninsured driver. Many states require
              it for crashes over $500 in damage.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
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
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.lg },
  heading: { fontSize: FONT.heading, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  toggleLabel: { fontSize: FONT.body, color: COLORS.text, flex: 1 },
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
  infoBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: FONT.body,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  infoText: { fontSize: FONT.body, color: COLORS.text, lineHeight: 22 },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  nextText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  disabled: { opacity: 0.5 },
  laterNote: {
    backgroundColor: COLORS.separator,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  laterText: {
    fontSize: FONT.body,
    color: COLORS.textMuted,
    lineHeight: 21,
  },
  optional: {
    fontFamily: 'Poppins_400Regular', fontWeight: '400',
    color: COLORS.textMuted,
    textTransform: 'none',
  },
});
