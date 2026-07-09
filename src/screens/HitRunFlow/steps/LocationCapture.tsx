import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HitRunStackParamList } from '../../../navigation/types';
import StepHeader from '../../../components/StepHeader';
import {
  requestLocationPermission,
  getCurrentLocation,
  type LocationResult,
} from '../../../services/location';
import { updateIncidentLocation } from '../../../services/incidentService';
import { useIncidentStore } from '../../../store/incidentStore';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/theme';
import AddressAutocomplete from '../../../components/AddressAutocomplete';

type Props = NativeStackScreenProps<HitRunStackParamList, 'LocationCapture'>;

export default function LocationCapture({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [gpsObtained, setGpsObtained] = useState(false);
  const [gpsLabel, setGpsLabel] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { activeIncident, completeStep } = useIncidentStore();

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermission();
      if (!granted) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      try {
        const loc = await getCurrentLocation();
        setLat(loc.lat);
        setLng(loc.lng);
        setGpsObtained(true);
        if (loc.label) {
          setAddress(loc.label);
          setGpsLabel(loc.label);
        }
      } catch {
        setPermissionDenied(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const confirm = async (label: string, finalLat: number, finalLng: number) => {
    if (!label.trim() || !activeIncident) return;
    setSaving(true);
    try {
      await updateIncidentLocation(activeIncident.id, {
        lat: finalLat,
        lng: finalLng,
        label: label.trim(),
      } as LocationResult);
      completeStep('location_capture');
      navigation.navigate('DamagePhotos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StepHeader
        title="Incident Location"
        step={1}
        total={9}
        onBack={() => navigation.getParent()?.navigate('Home' as never)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Where was your car hit?</Text>

        {loading ? (
          <View style={styles.gpsCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.gpsLoading}>Getting your GPS location…</Text>
          </View>
        ) : gpsObtained && !permissionDenied ? (
          <View style={styles.gpsCard}>
            <Text style={styles.gpsIcon}>📍</Text>
            <View style={styles.gpsBody}>
              <Text style={styles.gpsTitle}>GPS Captured</Text>
              {(lat !== 0 || lng !== 0) && (
                <Text style={styles.gpsCords}>{lat.toFixed(6)}, {lng.toFixed(6)}</Text>
              )}
              <Text style={styles.gpsNote}>
                Exact coordinates saved. Verify or correct the address below.
              </Text>
            </View>
          </View>
        ) : permissionDenied ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              GPS unavailable — confirm the full address below so your report has a location.
            </Text>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Address</Text>
          <AddressAutocomplete
            value={address}
            onChangeText={text => {
              setAddress(text);
              if (gpsLabel && text !== gpsLabel) { setLat(0); setLng(0); }
            }}
            onSelect={(label, selLat, selLng) => {
              setAddress(label);
              setLat(selLat);
              setLng(selLng);
            }}
            placeholder="e.g. 4820 Sunset Blvd, Los Angeles, CA 90027"
          />
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, (!address.trim() || saving) && styles.buttonDisabled]}
          onPress={() => confirm(address, lat, lng)}
          disabled={!address.trim() || saving}
        >
          {saving
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.confirmText}>Confirm Location</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.lg },
  heading: { fontSize: FONT.heading, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  gpsCard: {
    backgroundColor: '#EFF6FF', borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: '#BFDBFE',
    flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start',
  },
  gpsLoading: { fontSize: FONT.body, color: COLORS.primary },
  gpsIcon: { fontSize: 26, marginTop: 2 },
  gpsBody: { flex: 1, gap: 3 },
  gpsTitle: { fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.primary },
  gpsCords: { fontSize: 12, color: COLORS.textMuted, fontFamily: 'Courier' },
  gpsNote: { fontSize: FONT.label, color: COLORS.primary, lineHeight: 18, marginTop: 2 },
  warningCard: {
    backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.md, padding: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: COLORS.danger,
  },
  warningText: { fontSize: FONT.body, color: COLORS.text, lineHeight: 22 },
  fieldGroup: { gap: SPACING.xs },
  fieldLabel: {
    fontSize: FONT.label, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  confirmButton: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  confirmText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },
});
