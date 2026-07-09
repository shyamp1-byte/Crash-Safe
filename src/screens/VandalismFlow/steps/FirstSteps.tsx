import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { VandalismStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<VandalismStackParamList, 'FirstSteps'>;

const STEPS = [
  { icon: '🛑', title: 'Stay calm', body: 'Do not touch or move any evidence. Note the exact time you discovered the damage.' },
  { icon: '📸', title: 'Do not clean up yet', body: 'Preserve the scene exactly as you found it. Don\'t remove broken glass or debris before documenting.' },
  { icon: '🔒', title: 'Secure your vehicle', body: 'If windows are broken, find temporary covering to protect the interior from weather or theft.' },
  { icon: '🚔', title: 'Call the police', body: 'File a police report — most insurance claims require one for vandalism. Ask for the report number.' },
  { icon: '📞', title: 'Notify your insurance', body: 'Call your insurer to start a comprehensive claim. Vandalism is covered under comprehensive, not collision.' },
];

export default function FirstSteps({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Vandalism Discovered"
        step={1}
        total={8}
        onBack={() => navigation.getParent()?.navigate('Home' as never)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>🔨</Text>
          <View style={styles.alertBody}>
            <Text style={styles.alertTitle}>Vandalism documented</Text>
            <Text style={styles.alertSub}>Follow these steps immediately to protect your claim.</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>What to do right now</Text>

        {STEPS.map((s, i) => (
          <View key={i} style={styles.stepCard}>
            <View style={styles.stepLeft}>
              <Text style={styles.stepIcon}>{s.icon}</Text>
            </View>
            <View style={styles.stepRight}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepBody}>{s.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️  Vandalism must typically be reported within 24–72 hours for insurance purposes. Act quickly.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('LocationCapture')}
        >
          <Text style={styles.nextText}>Start Documentation →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.md },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.purpleLight,
    borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: COLORS.purple,
  },
  alertIcon: { fontSize: 28 },
  alertBody: { flex: 1, gap: 3 },
  alertTitle: { fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.purple },
  alertSub: { fontSize: FONT.label, color: COLORS.text, lineHeight: 18 },
  sectionLabel: {
    fontSize: FONT.label, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, gap: SPACING.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  stepLeft: {
    width: 44, height: 44, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.purpleLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepIcon: { fontSize: 22 },
  stepRight: { flex: 1, gap: 3 },
  stepTitle: { fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  stepBody: { fontSize: FONT.label, color: COLORS.textMuted, lineHeight: 19 },
  warningBox: {
    backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.md,
    padding: SPACING.md, borderLeftWidth: 4, borderLeftColor: COLORS.danger,
  },
  warningText: { fontSize: FONT.body, color: COLORS.text, lineHeight: 22 },
  footer: {
    padding: SPACING.lg, paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  nextText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
});
