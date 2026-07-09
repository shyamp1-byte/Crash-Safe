import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WeatherStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import PhotoCapture, { type PhotoItem } from '../../../components/PhotoCapture';
import { addPhoto } from '../../../services/incidentService';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';

type Props = NativeStackScreenProps<WeatherStackParamList, 'ScenePhotos'>;

export default function ScenePhotos({ navigation }: Props) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [saving, setSaving] = useState(false);
  const { activeIncident, completeStep } = useIncidentStore();

  const handleNext = async () => {
    if (!activeIncident) return;
    setSaving(true);
    try {
      await Promise.all(photos.map(p => addPhoto(activeIncident.id, p.uri, 'scene', null, null)));
      completeStep('scene_photos');
    } finally { setSaving(false); }
    navigation.navigate('InsuranceGuidance');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader title="Scene Photos" step={4} total={7} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Photograph the scene</Text>
        <PhotoCapture
          photos={photos}
          onPhotosChange={setPhotos}
          hint="Capture the surrounding area, street signs, fallen tree or hail, flooding, and overall conditions at the scene."
        />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('InsuranceGuidance')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.nextButton, saving && styles.disabled]} onPress={handleNext} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextText}>Next{photos.length > 0 ? ` (${photos.length})` : ''}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  heading: { fontSize: FONT.heading, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
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
