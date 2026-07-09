import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HitRunStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<HitRunStackParamList, 'CameraSearch'>;

const LOCATIONS = [
  { icon: '🚦', label: 'Traffic cameras', detail: 'Check intersections and traffic lights' },
  { icon: '🏧', label: 'ATM machines', detail: 'Banks and convenience stores nearby' },
  { icon: '🏪', label: 'Business storefronts', detail: 'Restaurants, shops, gas stations' },
  { icon: '🅿️', label: 'Parking lots', detail: 'Many have wide-angle security cameras' },
  { icon: '🏠', label: 'Doorbell cameras', detail: 'Residential Ring/Nest cameras on nearby homes' },
  { icon: '🚌', label: 'Transit cameras', detail: 'Bus stops and transit shelters' },
];

export default function CameraSearch({ navigation }: Props) {
  const { activeIncident, completeStep } = useIncidentStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Find Cameras"
        step={4}
        total={9}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Look for surveillance cameras</Text>
        <Text style={styles.subheading}>
          A nearby camera may have captured the vehicle that hit you. Act fast —
          footage is often overwritten within 24–72 hours.
        </Text>

        <View style={styles.urgent}>
          <Text style={styles.urgentText}>
            ⏱️ Do this NOW. Footage may be deleted within 24–72 hours.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Check these locations nearby:</Text>

        <View style={styles.list}>
          {LOCATIONS.map((loc, i) => (
            <View key={i} style={styles.locationCard}>
              <Text style={styles.locationIcon}>{loc.icon}</Text>
              <View style={styles.locationText}>
                <Text style={styles.locationLabel}>{loc.label}</Text>
                <Text style={styles.locationDetail}>{loc.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 What to say to business owners</Text>
          <Text style={styles.tipText}>
            "My parked car was hit by a hit-and-run driver. I'm filing a police report and
            I was wondering if your security camera might have captured it. Could I get a
            copy of the footage from [time] today?"
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            if (activeIncident) completeStep('camera_search');
            navigation.navigate('WitnessSearch');
          }}
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
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.md },
  heading: { fontSize: FONT.heading, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  subheading: { fontSize: FONT.body, color: COLORS.textMuted, lineHeight: 22 },
  urgent: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  urgentText: { fontSize: FONT.body, color: COLORS.danger, fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  sectionTitle: {
    fontSize: FONT.body,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.text,
  },
  list: { gap: SPACING.sm },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  locationIcon: { fontSize: 28 },
  locationText: { flex: 1 },
  locationLabel: { fontSize: FONT.body, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.text },
  locationDetail: { fontSize: FONT.label, color: COLORS.textMuted, marginTop: 2 },
  tipBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  tipTitle: { fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.primary },
  tipText: {
    fontSize: FONT.body,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
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
});
