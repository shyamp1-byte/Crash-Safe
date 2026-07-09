import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, RADIUS, FONT } from '../../constants/theme';
import {
  getIncidentSteps,
  saveStepData,
  getAllIncidents,
  getIncidentPhotos,
  normalizePhotoUri,
  updateIncidentLocation,
  addPhoto,
  deletePhoto,
} from '../../services/incidentService';
import { generateIncidentPDF } from '../../services/pdfService';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import type Incident from '../../db/models/Incident';
import type IncidentStep from '../../db/models/IncidentStep';
import type Photo from '../../db/models/Photo';

type Props = NativeStackScreenProps<RootStackParamList, 'IncidentDetail'>;

interface Witness { name: string; phone: string; }

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function parseStepData(step: IncidentStep): Record<string, unknown> {
  try { return step.data ? JSON.parse(step.data) : {}; }
  catch { return {}; }
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

function Field({
  label, value, onChange, placeholder, keyboard = 'default',
  multiline = false, autoCapitalize = 'sentences',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboard?: 'default' | 'phone-pad' | 'email-address';
  multiline?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
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

function PhotoThumb({ uri, label, onDelete }: { uri: string; label: string; onDelete: () => void }) {
  const [failed, setFailed] = React.useState(false);
  const resolvedUri = normalizePhotoUri(uri);
  return (
    <View style={styles.photoItem}>
      <View style={styles.photoThumbWrap}>
        {failed ? (
          <View style={[styles.photoThumb, styles.photoError]}>
            <Text style={styles.photoErrorText}>📷{'\n'}Unavailable</Text>
          </View>
        ) : (
          <Image
            source={{ uri: resolvedUri }}
            style={styles.photoThumb}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        )}
        <TouchableOpacity style={styles.photoDeleteBtn} onPress={onDelete}>
          <Text style={styles.photoDeleteText}>✕</Text>
        </TouchableOpacity>
      </View>
      {label ? <Text style={styles.photoLabel}>{label}</Text> : null}
    </View>
  );
}

function EditActions({ onCancel, onSave, saving }: { onCancel: () => void; onSave: () => void; saving: boolean }) {
  return (
    <View style={styles.editActions}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={onSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveText}>Save</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function IncidentDetail({ route, navigation }: Props) {
  const { incidentId } = route.params;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [steps, setSteps] = useState<IncidentStep[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Police report edit state
  const [editingPolice, setEditingPolice] = useState(false);
  const [reportNumber, setReportNumber] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [officerBadge, setOfficerBadge] = useState('');
  const [savingPolice, setSavingPolice] = useState(false);

  // Other driver edit state
  const [editingDriver, setEditingDriver] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverInsurance, setDriverInsurance] = useState('');
  const [driverPolicy, setDriverPolicy] = useState('');
  const [driverPlate, setDriverPlate] = useState('');
  const [driverMake, setDriverMake] = useState('');
  const [savingDriver, setSavingDriver] = useState(false);

  // Witnesses edit state
  const [editingWitnesses, setEditingWitnesses] = useState(false);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [savingWitnesses, setSavingWitnesses] = useState(false);

  // Notes edit state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Location edit state
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  // Photo state
  const [addingPhoto, setAddingPhoto] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllIncidents();
      const found = all.find(i => i.id === incidentId) ?? null;
      setIncident(found);
      const incidentSteps = await getIncidentSteps(incidentId);
      setSteps(incidentSteps);
      setPhotos(await getIncidentPhotos(incidentId));

      const stepMap = Object.fromEntries(incidentSteps.map(s => [s.stepKey, parseStepData(s)]));

      const pd = stepMap['police_report'] as Record<string, string> | undefined;
      setReportNumber((pd?.reportNumber as string) ?? '');
      setOfficerName((pd?.officerName as string) ?? '');
      setOfficerBadge((pd?.officerBadge as string) ?? '');

      const od = stepMap['other_driver_info'] as Record<string, string> | undefined;
      setDriverName(od?.name ?? '');
      setDriverPhone(od?.phone ?? '');
      setDriverLicense(od?.license ?? '');
      setDriverInsurance(od?.insurance ?? '');
      setDriverPolicy(od?.policy ?? '');
      setDriverPlate(od?.plate ?? '');
      setDriverMake(od?.make ?? '');

      const wi = stepMap['witness_info'] as { witnesses?: Witness[] } | undefined;
      setWitnesses(wi?.witnesses ?? []);

      const nd = stepMap['notes'] as { notes?: string } | undefined;
      setNotesText(nd?.notes ?? '');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => { load(); }, [load]);

  const saveSection = async (
    key: string,
    data: Record<string, unknown>,
    setSaving: (v: boolean) => void,
    setEditing: (v: boolean) => void,
  ) => {
    setSaving(true);
    try {
      await saveStepData(incidentId, key, data);
      setEditing(false);
      await load();
    } catch {
      Alert.alert('Error', 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      await generateIncidentPDF(incidentId);
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSaveLocation = async (label: string, lat: number, lng: number) => {
    setSavingLocation(true);
    try {
      await updateIncidentLocation(incidentId, { lat, lng, label });
      setEditingLocation(false);
      await load();
    } catch {
      Alert.alert('Error', 'Could not save location. Please try again.');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleAddPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add photos.');
      return;
    }
    setAddingPhoto(true);
    try {
      Alert.alert('Add Photo', 'Choose source', [
        {
          text: 'Camera',
          onPress: async () => {
            const cam = await ImagePicker.requestCameraPermissionsAsync();
            if (!cam.granted) return;
            const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
            if (!result.canceled && result.assets[0]) {
              await addPhoto(incidentId, result.assets[0].uri, 'photo', null, null);
              await load();
            }
            setAddingPhoto(false);
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.85,
            });
            if (!result.canceled && result.assets[0]) {
              await addPhoto(incidentId, result.assets[0].uri, 'photo', null, null);
              await load();
            }
            setAddingPhoto(false);
          },
        },
        { text: 'Cancel', style: 'cancel', onPress: () => setAddingPhoto(false) },
      ]);
    } catch {
      setAddingPhoto(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Delete Photo', 'Remove this photo from the report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePhoto(photoId);
          await load();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header onBack={() => navigation.goBack()} />
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header onBack={() => navigation.goBack()} />
        <View style={styles.center}><Text style={styles.errorText}>Incident not found.</Text></View>
      </SafeAreaView>
    );
  }

  const isCrash = incident.type === 'crash';
  const stepMap = Object.fromEntries(steps.map(s => [s.stepKey, parseStepData(s)]));

  const otherDriver = stepMap['other_driver_info'] as Record<string, string> | undefined;
  const witnessInfo = stepMap['witness_info'] as { witnesses?: Witness[] } | undefined;
  const notesData = stepMap['notes'] as { notes?: string } | undefined;
  const policeData = stepMap['police_report'] as {
    policeCalled?: boolean; reportNumber?: string;
    officerName?: string; officerBadge?: string;
  } | undefined;

  const hasOtherDriver = !!(otherDriver && Object.values(otherDriver).some(v => v));
  const hasWitnesses = !!(witnessInfo?.witnesses?.length);
  const hasNotes = !!(notesData?.notes?.trim());
  const policeCalled = policeData?.policeCalled;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryType}>{isCrash ? '🚨 Vehicle Crash' : '🚗 Hit & Run'}</Text>
              <View style={[styles.statusBadge, incident.status === 'complete' ? styles.statusComplete : styles.statusInProgress]}>
                <Text style={styles.statusText}>{incident.status === 'complete' ? 'Complete' : 'In Progress'}</Text>
              </View>
            </View>
            <Text style={styles.summaryDate}>{formatDate(incident.createdAt)}</Text>
            {incident.locationLabel && <Text style={styles.summaryLocation}>📍 {incident.locationLabel}</Text>}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            {!editingLocation ? (
              <View style={styles.card}>
                {incident.locationLabel ? (
                  <Text style={styles.dataValue}>{incident.locationLabel}</Text>
                ) : (
                  <Text style={styles.emptyField}>No location recorded yet.</Text>
                )}
                {incident.locationLat ? (
                  <Text style={styles.coordText}>{incident.locationLat.toFixed(6)}, {incident.locationLng?.toFixed(6)}</Text>
                ) : null}
                <TouchableOpacity style={styles.editButton} onPress={() => {
                  setLocationText(incident.locationLabel ?? '');
                  setEditingLocation(true);
                }}>
                  <Text style={styles.editButtonText}>{incident.locationLabel ? 'Edit' : '+ Add Location'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.card, styles.locationEditCard]}>
                <Text style={styles.fieldLabel}>Address</Text>
                <AddressAutocomplete
                  value={locationText}
                  onChangeText={setLocationText}
                  onSelect={(label, lat, lng) => handleSaveLocation(label, lat, lng)}
                  placeholder="Street address or intersection"
                />
                <EditActions
                  onCancel={() => setEditingLocation(false)}
                  onSave={() => handleSaveLocation(locationText, incident.locationLat ?? 0, incident.locationLng ?? 0)}
                  saving={savingLocation}
                />
              </View>
            )}
          </View>

          {/* Other Driver — crash only */}
          {isCrash && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚗 Other Driver</Text>
              {!editingDriver ? (
                <View style={styles.card}>
                  {hasOtherDriver ? (
                    <>
                      <DataRow label="Name" value={otherDriver?.name} />
                      <DataRow label="Phone" value={otherDriver?.phone} />
                      <DataRow label="License #" value={otherDriver?.license} />
                      <DataRow label="Insurance" value={otherDriver?.insurance} />
                      <DataRow label="Policy #" value={otherDriver?.policy} />
                      <DataRow label="License Plate" value={otherDriver?.plate} />
                      <DataRow label="Vehicle" value={otherDriver?.make} />
                    </>
                  ) : (
                    <Text style={styles.emptyField}>No driver information added yet.</Text>
                  )}
                  <TouchableOpacity style={styles.editButton} onPress={() => setEditingDriver(true)}>
                    <Text style={styles.editButtonText}>{hasOtherDriver ? 'Edit' : '+ Add Driver Info'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.card}>
                  <Field label="Full Name" value={driverName} onChange={setDriverName} placeholder="Jane Doe" autoCapitalize="words" />
                  <Field label="Phone" value={driverPhone} onChange={setDriverPhone} placeholder="(555) 000-0000" keyboard="phone-pad" />
                  <Field label="Driver's License #" value={driverLicense} onChange={setDriverLicense} placeholder="DL12345678" autoCapitalize="characters" />
                  <Field label="Insurance Company" value={driverInsurance} onChange={setDriverInsurance} placeholder="State Farm" autoCapitalize="words" />
                  <Field label="Policy Number" value={driverPolicy} onChange={setDriverPolicy} placeholder="POL-123456" autoCapitalize="characters" />
                  <Field label="License Plate" value={driverPlate} onChange={setDriverPlate} placeholder="ABC 1234" autoCapitalize="characters" />
                  <Field label="Vehicle Make & Model" value={driverMake} onChange={setDriverMake} placeholder="Toyota Camry 2022" autoCapitalize="words" />
                  <EditActions
                    onCancel={() => setEditingDriver(false)}
                    onSave={() => saveSection('other_driver_info', {
                      name: driverName, phone: driverPhone, license: driverLicense,
                      insurance: driverInsurance, policy: driverPolicy,
                      plate: driverPlate, make: driverMake,
                    }, setSavingDriver, setEditingDriver)}
                    saving={savingDriver}
                  />
                </View>
              )}
            </View>
          )}

          {/* Police Report */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚔 Police Report</Text>
            {!editingPolice ? (
              <View style={styles.card}>
                {policeData == null ? (
                  <Text style={styles.emptyField}>Not yet recorded.</Text>
                ) : policeCalled ? (
                  <>
                    <Text style={styles.policeStatus}>Police were called</Text>
                    <DataRow label="Report #" value={policeData.reportNumber} />
                    <DataRow label="Officer" value={policeData.officerName} />
                    <DataRow label="Badge / Unit" value={policeData.officerBadge} />
                    {!policeData.reportNumber && <Text style={styles.missingNote}>Report number not yet added</Text>}
                  </>
                ) : (
                  <Text style={styles.dataValue}>No police involvement recorded</Text>
                )}
                <TouchableOpacity style={styles.editButton} onPress={() => setEditingPolice(true)}>
                  <Text style={styles.editButtonText}>
                    {policeCalled && !policeData?.reportNumber ? '+ Add Report Number' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <Field label="Report Number" value={reportNumber} onChange={setReportNumber} placeholder="RPT-2026-001234" autoCapitalize="characters" />
                <Field label="Officer Name" value={officerName} onChange={setOfficerName} placeholder="Officer J. Smith" autoCapitalize="words" />
                <Field label="Badge / Unit Number" value={officerBadge} onChange={setOfficerBadge} placeholder="Badge #4521" autoCapitalize="characters" />
                <EditActions
                  onCancel={() => setEditingPolice(false)}
                  onSave={() => saveSection('police_report', {
                    policeCalled: true, reportNumber, officerName, officerBadge,
                  }, setSavingPolice, setEditingPolice)}
                  saving={savingPolice}
                />
              </View>
            )}
          </View>

          {/* Witnesses */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Witnesses</Text>
            {!editingWitnesses ? (
              <View style={styles.card}>
                {hasWitnesses ? (
                  witnessInfo!.witnesses!.map((w, i) => (
                    <View key={i} style={i > 0 ? styles.witnessBlock : undefined}>
                      <Text style={styles.witnessIndex}>Witness {i + 1}</Text>
                      <DataRow label="Name" value={w.name} />
                      <DataRow label="Phone" value={w.phone} />
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyField}>No witnesses recorded yet.</Text>
                )}
                <TouchableOpacity style={styles.editButton} onPress={() => {
                  setWitnesses(witnessInfo?.witnesses?.length ? [...witnessInfo.witnesses] : [{ name: '', phone: '' }]);
                  setEditingWitnesses(true);
                }}>
                  <Text style={styles.editButtonText}>{hasWitnesses ? 'Edit' : '+ Add Witness'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                {witnesses.map((w, i) => (
                  <View key={i} style={i > 0 ? styles.witnessEditBlock : undefined}>
                    <View style={styles.witnessEditHeader}>
                      <Text style={styles.witnessIndex}>Witness {i + 1}</Text>
                      <TouchableOpacity onPress={() => setWitnesses(prev => prev.filter((_, idx) => idx !== i))}>
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                    <Field label="Name" value={w.name}
                      onChange={v => setWitnesses(prev => prev.map((x, idx) => idx === i ? { ...x, name: v } : x))}
                      placeholder="Jane Doe" autoCapitalize="words" />
                    <Field label="Phone" value={w.phone}
                      onChange={v => setWitnesses(prev => prev.map((x, idx) => idx === i ? { ...x, phone: v } : x))}
                      placeholder="(555) 000-0000" keyboard="phone-pad" />
                  </View>
                ))}
                <TouchableOpacity style={styles.addWitnessButton}
                  onPress={() => setWitnesses(prev => [...prev, { name: '', phone: '' }])}>
                  <Text style={styles.addWitnessText}>+ Add Another Witness</Text>
                </TouchableOpacity>
                <EditActions
                  onCancel={() => setEditingWitnesses(false)}
                  onSave={() => saveSection('witness_info', { witnesses }, setSavingWitnesses, setEditingWitnesses)}
                  saving={savingWitnesses}
                />
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Notes</Text>
            {!editingNotes ? (
              <View style={styles.card}>
                {hasNotes ? (
                  <Text style={styles.notesText}>{notesData!.notes}</Text>
                ) : (
                  <Text style={styles.emptyField}>No notes added yet.</Text>
                )}
                <TouchableOpacity style={styles.editButton} onPress={() => setEditingNotes(true)}>
                  <Text style={styles.editButtonText}>{hasNotes ? 'Edit' : '+ Add Notes'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <Field label="Notes" value={notesText} onChange={setNotesText}
                  placeholder="Add any additional details about the incident…" multiline />
                <EditActions
                  onCancel={() => setEditingNotes(false)}
                  onSave={() => saveSection('notes', { notes: notesText }, setSavingNotes, setEditingNotes)}
                  saving={savingNotes}
                />
              </View>
            )}
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 Photos ({photos.length})</Text>
            {photos.length > 0 && (
              <View style={styles.photoGrid}>
                {photos.map(photo => (
                  <PhotoThumb
                    key={photo.id}
                    uri={photo.uri}
                    label={photo.label ?? ''}
                    onDelete={() => handleDeletePhoto(photo.id)}
                  />
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[styles.addPhotoButton, addingPhoto && styles.disabled]}
              onPress={handleAddPhoto}
              disabled={addingPhoto}
            >
              {addingPhoto
                ? <ActivityIndicator color={COLORS.primary} size="small" />
                : <Text style={styles.addPhotoText}>+ Add Photo</Text>
              }
            </TouchableOpacity>
          </View>

          {/* PDF */}
          <View style={styles.section}>
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
                  ? <ActivityIndicator color={COLORS.primary} />
                  : <Text style={styles.pdfButtonText}>Generate PDF Report</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Incident Details</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: FONT.body, color: COLORS.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: COLORS.primary },
  headerTitle: { flex: 1, fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  headerSpacer: { width: 36 },

  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, gap: SPACING.xs,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryType: { fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  statusComplete: { backgroundColor: COLORS.successLight },
  statusInProgress: { backgroundColor: COLORS.primaryLight },
  statusText: { fontSize: FONT.label, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.text },
  summaryDate: { fontSize: FONT.body, color: COLORS.textMuted },
  summaryLocation: { fontSize: FONT.body, color: COLORS.textMuted },

  section: { gap: SPACING.sm },
  sectionTitle: { fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, gap: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },

  dataRow: { gap: 2 },
  dataLabel: { fontSize: FONT.label, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  dataValue: { fontSize: FONT.body, color: COLORS.text },
  coordText: { fontSize: FONT.label, color: COLORS.textMuted },
  emptyField: { fontSize: FONT.body, color: COLORS.textMuted, fontStyle: 'italic' },
  missingNote: { fontSize: FONT.label, color: COLORS.textMuted, fontStyle: 'italic' },
  policeStatus: { fontSize: FONT.body, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.text },

  editButton: { alignSelf: 'flex-start', marginTop: SPACING.xs },
  editButtonText: { fontSize: FONT.body, color: COLORS.primary, fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },

  fieldGroup: { gap: SPACING.xs },
  fieldLabel: { fontSize: FONT.label, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4, fontSize: FONT.body, color: COLORS.text,
  },
  inputMultiline: { minHeight: 80, paddingTop: SPACING.sm + 4 },

  editActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, alignItems: 'center' },
  cancelText: { fontSize: FONT.body, color: COLORS.textMuted, fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  saveButton: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, alignItems: 'center' },
  saveText: { fontSize: FONT.body, color: '#FFF', fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  disabled: { opacity: 0.5 },

  witnessBlock: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm, gap: SPACING.xs },
  witnessEditBlock: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm, gap: SPACING.sm },
  witnessEditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  witnessIndex: { fontSize: FONT.label, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  removeText: { fontSize: FONT.label, color: COLORS.danger, fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  addWitnessButton: { paddingVertical: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, borderStyle: 'dashed' },
  addWitnessText: { fontSize: FONT.body, color: COLORS.primary, fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },

  notesText: { fontSize: FONT.body, color: COLORS.text, lineHeight: 22 },
  locationEditCard: { gap: SPACING.sm, zIndex: 10, overflow: 'visible' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  photoItem: { width: '47%' },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: '100%', aspectRatio: 1, borderRadius: RADIUS.sm },
  photoError: { backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  photoErrorText: { fontSize: FONT.label, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  photoLabel: { fontSize: FONT.label, color: COLORS.textMuted, marginTop: 4 },
  photoDeleteBtn: {
    position: 'absolute', top: 6, right: 6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  photoDeleteText: { color: '#FFF', fontSize: 11, fontFamily: 'Poppins_700Bold', fontWeight: '700', lineHeight: 14 },
  addPhotoButton: {
    borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed',
    borderRadius: RADIUS.md, paddingVertical: SPACING.sm + 2,
    alignItems: 'center', marginTop: SPACING.xs,
  },
  addPhotoText: { fontSize: FONT.body, color: COLORS.primary, fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },

  pdfSection: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg, gap: SPACING.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pdfTitle: { fontSize: FONT.bodyLg, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.text },
  pdfText: { fontSize: FONT.body, color: COLORS.textMuted, lineHeight: 22 },
  pdfButton: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center' },
  pdfButtonText: { fontSize: FONT.body, color: '#FFF', fontFamily: 'Poppins_700Bold', fontWeight: '700' },
});
