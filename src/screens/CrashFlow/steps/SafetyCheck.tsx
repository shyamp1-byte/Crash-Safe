import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CrashStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<CrashStackParamList, 'SafetyCheck'>;

const CHECKLIST = [
  { icon: '🚨', text: 'Move to a safe location away from traffic' },
  { icon: '⚠️', text: 'Turn on your hazard lights' },
  { icon: '🩺', text: 'Check yourself and all passengers for injuries' },
  { icon: '📞', text: 'Call 911 if anyone is injured' },
  { icon: '🤐', text: 'Do NOT apologize or admit fault' },
  { icon: '🚫', text: 'Do NOT move vehicles if anyone is seriously injured' },
];

export default function SafetyCheck({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Safety First"
        step={1}
        total={10}
        onBack={() =>
          navigation
            .getParent()
            ?.navigate('Home' as never)
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Before you document</Text>
        <Text style={styles.subheading}>
          Make sure you and everyone involved are safe.
        </Text>

        <View style={styles.checklist}>
          {CHECKLIST.map((item, i) => (
            <View key={i} style={styles.checkItem}>
              <Text style={styles.checkIcon}>{item.icon}</Text>
              <Text style={styles.checkText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>🛑 Stay calm</Text>
          <Text style={styles.warningText}>
            Adrenaline is high right now. Breathe. Take this step by step. We'll
            guide you through everything you need.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('LocationCapture')}
        >
          <Text style={styles.nextButtonText}>I'm Safe — Start Documenting</Text>
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
    marginBottom: SPACING.md,
  },
  checklist: { gap: SPACING.xs, marginBottom: SPACING.md },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  checkIcon: { fontSize: 20 },
  checkText: {
    flex: 1,
    fontSize: FONT.body,
    color: COLORS.text,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  warningTitle: {
    fontSize: FONT.body,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.danger,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: FONT.body,
    color: COLORS.text,
    lineHeight: 22,
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
  nextButtonText: {
    color: '#FFF',
    fontSize: FONT.bodyLg,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
  },
});
