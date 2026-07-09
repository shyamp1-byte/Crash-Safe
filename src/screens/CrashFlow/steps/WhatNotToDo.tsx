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
import type { CrashStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<CrashStackParamList, 'WhatNotToDo'>;

const DONT_LIST = [
  { icon: '🤐', rule: "Don't apologize or say 'I'm sorry'", reason: "Apologies are admissions of fault and can be used against you." },
  { icon: '🚫', rule: "Don't admit fault", reason: "Fault is determined by investigation — not at the scene." },
  { icon: '📱', rule: "Don't post on social media", reason: "Anything you share can be used as evidence." },
  { icon: '✍️', rule: "Don't sign anything", reason: "Not without consulting your insurer or attorney first." },
  { icon: '💰', rule: "Don't accept a cash settlement at the scene", reason: "Injuries and damage often appear hours or days later." },
  { icon: '🏎️', rule: "Don't leave the scene", reason: "It is illegal to leave before exchanging information." },
  { icon: '🔧', rule: "Don't repair your vehicle yet", reason: "Get a damage estimate first and report to insurance." },
];

export default function WhatNotToDo({ navigation }: Props) {
  const { completeStep } = useIncidentStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="What NOT To Do"
        step={8}
        total={10}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Protect yourself</Text>
        <Text style={styles.subheading}>
          What you say and do right now matters. Avoid these common mistakes.
        </Text>

        <View style={styles.list}>
          {DONT_LIST.map((item, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.rule}>{item.rule}</Text>
              </View>
              <Text style={styles.reason}>{item.reason}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            completeStep('what_not_to_do');
            navigation.navigate('Notes');
          }}
        >
          <Text style={styles.nextText}>Understood — Continue</Text>
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
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  list: { gap: SPACING.xs },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  icon: { fontSize: 18 },
  rule: {
    flex: 1,
    fontSize: FONT.body,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.text,
  },
  reason: { fontSize: FONT.label, color: COLORS.textMuted, lineHeight: 17 },
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
