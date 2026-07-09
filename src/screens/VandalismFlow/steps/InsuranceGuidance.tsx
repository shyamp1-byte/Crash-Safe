import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { VandalismStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<VandalismStackParamList, 'InsuranceGuidance'>;

const TIPS = [
  { icon: '📞', tip: 'Call your insurance company as soon as possible — ideally today' },
  { icon: '📋', tip: 'Have your policy number, police report number, and photos ready' },
  { icon: '🔧', tip: 'Do NOT repair your vehicle before the insurance adjuster inspects it' },
  { icon: '🧾', tip: 'Keep all receipts for temporary repairs (window covering, towing, storage)' },
  { icon: '📝', tip: 'Ask for a claim number and adjuster contact info in writing' },
  { icon: '⚖️', tip: 'If your claim is denied, you have the right to appeal — get the denial in writing' },
];

export default function InsuranceGuidance({ navigation }: Props) {
  const { activeIncident, completeStep } = useIncidentStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader title="Contact Insurance" step={6} total={8} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Notify your insurance company</Text>
        <Text style={styles.subheading}>
          Vandalism is covered under comprehensive coverage, not collision — no fault applies. Report promptly.
        </Text>

        <View style={styles.list}>
          {TIPS.map((item, i) => (
            <View key={i} style={styles.tipCard}>
              <Text style={styles.tipIcon}>{item.icon}</Text>
              <Text style={styles.tipText}>{item.tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.coverageBox}>
          <Text style={styles.coverageTitle}>📄 Relevant coverage types</Text>
          <Text style={styles.coverageItem}>
            • <Text style={styles.bold}>Comprehensive coverage</Text> — covers vandalism damage; deductible applies
          </Text>
          <Text style={styles.coverageItem}>
            • <Text style={styles.bold}>Glass coverage (if separate)</Text> — may cover broken windows with no deductible
          </Text>
          <Text style={styles.coverageItem}>
            • <Text style={styles.bold}>Rental reimbursement</Text> — covers a rental while your car is repaired, if you have it
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => { if (activeIncident) completeStep('insurance_guidance'); navigation.navigate('Notes'); }}
        >
          <Text style={styles.nextText}>Continue</Text>
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
  subheading: { fontSize: FONT.body, color: COLORS.textMuted, lineHeight: 22 },
  list: { gap: SPACING.sm },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, gap: SPACING.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  tipIcon: { fontSize: 22 },
  tipText: { flex: 1, fontSize: FONT.body, color: COLORS.text, lineHeight: 22 },
  coverageBox: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm,
  },
  coverageTitle: { fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
  coverageItem: { fontSize: FONT.body, color: COLORS.text, lineHeight: 22 },
  bold: { fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  footer: {
    padding: SPACING.lg, paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  nextButton: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  nextText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
});
