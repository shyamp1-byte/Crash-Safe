import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CrashStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import {
  markIncidentComplete,
  getIncidentPhotos,
  getIncidentSteps,
} from '../../../services/incidentService';
import { useIncidentStore } from '../../../store/incidentStore';
import { formatDateTime } from '../../../utils/timestamp';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';
import { generateIncidentPDF } from '../../../services/pdfService';
import type { RootStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<CrashStackParamList, 'GenerateReport'>;

interface Summary {
  photoCount: number;
  stepCount: number;
  location: string | null;
}

export default function GenerateReport({ navigation }: Props) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const { activeIncident, completeIncident } = useIncidentStore();

  useEffect(() => {
    if (!activeIncident) return;
    (async () => {
      const [photos, steps] = await Promise.all([
        getIncidentPhotos(activeIncident.id),
        getIncidentSteps(activeIncident.id),
      ]);
      setSummary({
        photoCount: photos.length,
        stepCount: steps.filter(s => s.completed).length,
        location: null,
      });
    })();
  }, [activeIncident]);

  const handleGeneratePDF = async () => {
    if (!activeIncident) return;
    setGeneratingPDF(true);
    try {
      await generateIncidentPDF(activeIncident.id);
    } catch {
      // share sheet dismissed or error — silent fail is fine here
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDone = async () => {
    if (!activeIncident) return;
    setFinishing(true);
    try {
      await markIncidentComplete(activeIncident.id);
      completeIncident();
      navigation
        .getParent<NativeStackNavigationProp<RootStackParamList>>()
        ?.navigate('Home');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Incident Report"
        step={10}
        total={10}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successBadge}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Documentation Complete</Text>
          <Text style={styles.successSub}>
            {formatDateTime(Date.now())}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary?.photoCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary?.stepCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Steps Done</Text>
          </View>
        </View>

        <View style={styles.pdfSection}>
          <Text style={styles.pdfTitle}>📄 Generate PDF Report</Text>
          <Text style={styles.pdfText}>
            A full insurance-ready PDF with all your photos, driver info, location,
            and notes — generated entirely on this device, no internet required.
          </Text>
          <TouchableOpacity
            style={[styles.pdfButton, generatingPDF && styles.disabled]}
            onPress={handleGeneratePDF}
            disabled={generatingPDF}
          >
            {generatingPDF
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.pdfButtonText}>Generate PDF Report</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your documentation is saved securely on this device. You can view it
            anytime in Incident History.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneButton, finishing && styles.disabled]}
          onPress={handleDone}
          disabled={finishing}
        >
          {finishing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.doneText}>Done — Back to Home</Text>
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
  successBadge: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  successIcon: { fontSize: 48 },
  successTitle: {
    fontSize: FONT.heading,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.success,
  },
  successSub: { fontSize: FONT.label, color: COLORS.textMuted },
  statsRow: { flexDirection: 'row', gap: SPACING.md },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 36,
    fontFamily: 'Poppins_800ExtraBold', fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: { fontSize: FONT.label, color: COLORS.textMuted },
  pdfSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pdfTitle: { fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  pdfText: { fontSize: FONT.body, color: COLORS.textMuted, lineHeight: 22 },
  pdfButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  pdfButtonText: { fontSize: FONT.body, color: '#FFF', fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  infoBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  infoText: { fontSize: FONT.body, color: COLORS.primary, lineHeight: 22 },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  doneButton: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  doneText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
