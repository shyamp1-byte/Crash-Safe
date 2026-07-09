import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WeatherStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<WeatherStackParamList, 'FirstSteps'>;

const STEPS = [
  { icon: '🛡️', title: 'Ensure your safety first', body: 'Stay away from downed power lines, flooded roads, or structurally unsafe areas around your vehicle.' },
  { icon: '📸', title: 'Document before touching anything', body: 'Photograph all damage before moving the vehicle, removing debris, or making any repairs.' },
  { icon: '🚗', title: 'Move to safety if needed', body: 'If the vehicle blocks traffic or is in a dangerous location, move it only after photographing its position.' },
  { icon: '📋', title: 'File a police/incident report', body: 'For significant weather events, an official report can support your insurance claim.' },
  { icon: '📞', title: 'Contact your insurer promptly', body: 'Comprehensive coverage handles weather damage. Report as soon as possible — storms often cause claim surges.' },
];

export default function FirstSteps({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Weather Damage"
        step={1}
        total={7}
        onBack={() => navigation.getParent()?.navigate('Home' as never)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>🌪️</Text>
          <View style={styles.alertBody}>
            <Text style={styles.alertTitle}>Weather damage detected</Text>
            <Text style={styles.alertSub}>Document thoroughly — weather claims require strong photo evidence.</Text>
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

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Weather types covered</Text>
          <Text style={styles.infoItem}>• Hail damage to roof, hood, and glass</Text>
          <Text style={styles.infoItem}>• Fallen tree or branch impact</Text>
          <Text style={styles.infoItem}>• Flood or water intrusion damage</Text>
          <Text style={styles.infoItem}>• Wind damage from storms or tornadoes</Text>
          <Text style={styles.infoItem}>• Lightning strike damage</Text>
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
    backgroundColor: COLORS.tealLight,
    borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: COLORS.teal,
  },
  alertIcon: { fontSize: 28 },
  alertBody: { flex: 1, gap: 3 },
  alertTitle: { fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.teal },
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
    backgroundColor: COLORS.tealLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepIcon: { fontSize: 22 },
  stepRight: { flex: 1, gap: 3 },
  stepTitle: { fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  stepBody: { fontSize: FONT.label, color: COLORS.textMuted, lineHeight: 19 },
  infoBox: {
    backgroundColor: COLORS.tealLight, borderRadius: RADIUS.md,
    padding: SPACING.md, gap: SPACING.xs,
  },
  infoTitle: { fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.teal, marginBottom: SPACING.xs },
  infoItem: { fontSize: FONT.body, color: COLORS.text, lineHeight: 22 },
  footer: {
    padding: SPACING.lg, paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.teal, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  nextText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
});
