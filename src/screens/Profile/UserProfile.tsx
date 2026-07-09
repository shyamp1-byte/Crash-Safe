import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, RADIUS, FONT } from '../../constants/theme';
import { getProfile, saveProfile } from '../../services/incidentService';
import { supabase } from '../../services/supabase';
import { syncToCloud } from '../../services/sync';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

interface FormState {
  fullName: string;
  email: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  licensePlate: string;
  insuranceCompany: string;
  policyNumber: string;
  bloodType: string;
  medications: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  profilePicture: string;
}

const EMPTY: FormState = {
  fullName: '', email: '',
  vehicleMake: '', vehicleModel: '', vehicleYear: '', licensePlate: '',
  insuranceCompany: '', policyNumber: '',
  bloodType: '', medications: '', allergies: '',
  emergencyContactName: '', emergencyContactPhone: '',
  profilePicture: '',
};

export default function UserProfile({ navigation }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { session } = useAuthStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getProfile();
      if (profile) {
        setForm({
          fullName: profile.fullName ?? '',
          email: profile.email ?? '',
          vehicleMake: profile.vehicleMake ?? '',
          vehicleModel: profile.vehicleModel ?? '',
          vehicleYear: profile.vehicleYear ?? '',
          licensePlate: profile.licensePlate ?? '',
          insuranceCompany: profile.insuranceCompany ?? '',
          policyNumber: profile.policyNumber ?? '',
          bloodType: profile.bloodType ?? '',
          medications: profile.medications ?? '',
          allergies: profile.allergies ?? '',
          emergencyContactName: profile.emergencyContactName ?? '',
          emergencyContactPhone: profile.emergencyContactPhone ?? '',
          profilePicture: profile.profilePicture
            ? `${FileSystem.documentDirectory}${profile.profilePicture}`
            : '',
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: keyof FormState) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const tmpUri = result.assets[0].uri;
    const ext = tmpUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    // unique filename per pick so RN image cache never serves stale file
    const filename = `profile_picture_${Date.now()}.${ext}`;
    const dest = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.copyAsync({ from: tmpUri, to: dest });
    setForm(prev => ({ ...prev, profilePicture: dest }));
  };

  const handleSync = async () => {
    if (!session) {
      navigation.navigate('Login');
      return;
    }
    setSyncing(true);
    try {
      const result = await syncToCloud();
      const msg = `${result.incidents} incident${result.incidents !== 1 ? 's' : ''} and ${result.photos} photo${result.photos !== 1 ? 's' : ''} backed up.`;
      const errDetail = result.errors.slice(0, 3).join('\n');
      Alert.alert('Backup complete', result.errors.length ? `${msg}\n\nErrors:\n${errDetail}` : msg);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Backup failed.';
      Alert.alert('Backup failed', message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Sign out of cloud backup?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({
        fullName: form.fullName || undefined,
        email: form.email || undefined,
        vehicleMake: form.vehicleMake || undefined,
        vehicleModel: form.vehicleModel || undefined,
        vehicleYear: form.vehicleYear || undefined,
        licensePlate: form.licensePlate || undefined,
        insuranceCompany: form.insuranceCompany || undefined,
        policyNumber: form.policyNumber || undefined,
        bloodType: form.bloodType || undefined,
        medications: form.medications || undefined,
        allergies: form.allergies || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        // store only the filename so the path survives rebuilds/reinstalls
        profilePicture: form.profilePicture
          ? form.profilePicture.split('/').pop()
          : undefined,
      });
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Profile picture */}
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarWrapper} onPress={pickPhoto}>
                {form.profilePicture ? (
                  <Image source={{ uri: form.profilePicture }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderIcon}>👤</Text>
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <Text style={styles.avatarEditText}>✏️</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to change photo</Text>
            </View>

            <Text style={styles.hint}>
              Stored locally on your device. Pre-fills your incident reports and PDF exports.
            </Text>

            <Section title="👤 Personal">
              <Field label="Full Name" value={form.fullName} onChange={set('fullName')} placeholder="Jane Doe" />
              <Field label="Email" value={form.email} onChange={set('email')} placeholder="jane@example.com" keyboard="email-address" autoCapitalize="none" />
            </Section>

            <Section title="🚗 Your Vehicle">
              <Field label="Make" value={form.vehicleMake} onChange={set('vehicleMake')} placeholder="Toyota" />
              <Field label="Model" value={form.vehicleModel} onChange={set('vehicleModel')} placeholder="Camry" />
              <Field label="Year" value={form.vehicleYear} onChange={set('vehicleYear')} placeholder="2022" keyboard="number-pad" />
              <Field label="License Plate" value={form.licensePlate} onChange={set('licensePlate')} placeholder="ABC 1234" autoCapitalize="characters" />
            </Section>

            <Section title="🛡️ Insurance">
              <Field label="Insurance Company" value={form.insuranceCompany} onChange={set('insuranceCompany')} placeholder="State Farm" />
              <Field label="Policy Number" value={form.policyNumber} onChange={set('policyNumber')} placeholder="POL-123456" />
            </Section>

            <Section title="🏥 Medical & Emergency">
              <Text style={styles.sectionNote}>
                Shown to first responders if you're unable to communicate.
              </Text>
              <Field label="Blood Type" value={form.bloodType} onChange={set('bloodType')} placeholder="A+" autoCapitalize="characters" />
              <Field label="Medications" value={form.medications} onChange={set('medications')} placeholder="Metformin, Lisinopril…" multiline />
              <Field label="Allergies" value={form.allergies} onChange={set('allergies')} placeholder="Penicillin, latex…" multiline />
              <Field label="Emergency Contact Name" value={form.emergencyContactName} onChange={set('emergencyContactName')} placeholder="John Doe" />
              <Field label="Emergency Contact Phone" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} placeholder="(555) 000-0000" keyboard="phone-pad" />
            </Section>

            {/* Cloud Backup */}
            <View style={styles.cloudSection}>
              <Text style={styles.cloudTitle}>☁️ Cloud Backup</Text>
              {session ? (
                <>
                  <View style={styles.cloudSignedIn}>
                    <Text style={styles.cloudEmail}>{session.user.email}</Text>
                    <TouchableOpacity onPress={handleSignOut}>
                      <Text style={styles.signOutText}>Sign out</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.syncButton, syncing && styles.disabled]}
                    onPress={handleSync}
                    disabled={syncing}
                  >
                    {syncing
                      ? <ActivityIndicator color={COLORS.primary} />
                      : <Text style={styles.syncText}>Back Up Now</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.cloudDesc}>
                    Create a free account to back up your incidents, photos, and profile to the cloud.
                  </Text>
                  <TouchableOpacity style={styles.syncButton} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.syncText}>Sign In / Create Account</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.saveText}>Save Profile</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
}

function Field({
  label, value, onChange, placeholder,
  keyboard = 'default', autoCapitalize = 'words', multiline = false,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboard}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: COLORS.primary },
  headerTitle: {
    flex: 1,
    fontSize: FONT.bodyLg,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerSpacer: { width: 36 },

  avatarSection: { alignItems: 'center', gap: SPACING.sm },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.border,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  avatarPlaceholderIcon: { fontSize: 40 },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditText: { fontSize: 12 },
  avatarHint: { fontSize: FONT.label, color: COLORS.textMuted },

  hint: {
    fontSize: FONT.label,
    color: COLORS.textMuted,
    lineHeight: 19,
    textAlign: 'center',
  },

  section: { gap: SPACING.sm },
  sectionTitle: { fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  sectionNote: { fontSize: FONT.label, color: COLORS.textMuted, lineHeight: 18 },
  sectionCard: {
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

  fieldGroup: { gap: SPACING.xs },
  fieldLabel: {
    fontSize: FONT.label,
    fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT.body,
    color: COLORS.text,
  },
  inputMultiline: {
    minHeight: 72,
    paddingTop: SPACING.sm + 4,
  },

  cloudSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cloudTitle: { fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  cloudDesc: { fontSize: FONT.label, color: COLORS.textMuted, lineHeight: 19 },
  cloudSignedIn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cloudEmail: { fontSize: FONT.body, color: COLORS.text, fontFamily: 'Poppins_500Medium', fontWeight: '500' },
  signOutText: { fontSize: FONT.label, color: COLORS.danger, fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  syncButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm + 4,
    alignItems: 'center',
  },
  syncText: { color: COLORS.primary, fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveText: { color: '#FFF', fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
