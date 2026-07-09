import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HitRunStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { saveStepData } from '../../../services/incidentService';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<HitRunStackParamList, 'Notes'>;

const PROMPTS = [
  'Approximate time you discovered the damage?',
  'Any description of the other vehicle?',
  'Any partial plate number seen?',
  'People or businesses you spoke to?',
  'Anything else relevant?',
];

export default function Notes({ navigation }: Props) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { activeIncident, completeStep } = useIncidentStore();

  const handleNext = async () => {
    if (!activeIncident) return;
    setSaving(true);
    try {
      await saveStepData(activeIncident.id, 'notes', { notes });
      completeStep('notes');
    } finally {
      setSaving(false);
    }
    navigation.navigate('GenerateReport');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Notes"
        step={8}
        total={9}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Additional details</Text>
          <Text style={styles.subheading}>Note everything while it's fresh.</Text>

          <View style={styles.prompts}>
            {PROMPTS.map((p, i) => (
              <Text key={i} style={styles.prompt}>
                • {p}
              </Text>
            ))}
          </View>

          <TextInput
            style={styles.textarea}
            placeholder="Type your notes here…"
            placeholderTextColor={COLORS.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('GenerateReport')}
          >
            <Text style={styles.skipText}>Skip notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, saving && styles.disabled]}
            onPress={handleNext}
            disabled={saving || notes.trim().length === 0}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.nextText}>Save & Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: { flex: 1, padding: SPACING.lg },
  heading: {
    fontSize: FONT.heading,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: FONT.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  prompts: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  prompt: { fontSize: FONT.label, color: COLORS.primary, lineHeight: 20 },
  textarea: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT.body,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 180,
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
