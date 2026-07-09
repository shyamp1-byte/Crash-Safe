import { supabase } from './supabase';
import { getDatabase } from '../db';
import { getAllIncidents, getIncidentSteps, getIncidentPhotos, getProfile } from './incidentService';
import { normalizePhotoUri } from './incidentService';

export interface SyncResult {
  incidents: number;
  photos: number;
  errors: string[];
}

const SAFE_URI_RE = /^(file|ph|content):\/\//;
const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp']);

async function uploadPhoto(uri: string, userId: string, photoId: string): Promise<{ url: string | null; error: string | null }> {
  try {
    const normalized = normalizePhotoUri(uri);

    if (!SAFE_URI_RE.test(normalized) || normalized.includes('..')) {
      return { url: null, error: `Unsafe URI scheme: ${normalized.slice(0, 40)}` };
    }

    const rawExt = normalized.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
    const ext = ALLOWED_EXTS.has(rawExt) ? rawExt : 'jpg';
    const path = `${userId}/${photoId}.${ext}`;
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    // fetch → arrayBuffer avoids atob/Buffer which don't exist in Hermes
    const response = await fetch(normalized);
    if (!response.ok && response.status !== 0) {
      return { url: null, error: `fetch status ${response.status}` };
    }
    const binary = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from('incident-photos')
      .upload(path, binary, { contentType, upsert: true });

    if (error) return { url: null, error: error.message };

    // Store the storage path (not a public URL) so bucket can stay private.
    // Generate a signed URL on demand when displaying photos.
    return { url: path, error: null };
  } catch (e: unknown) {
    return { url: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function syncToCloud(): Promise<SyncResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const userId = session.user.id;
  const db = getDatabase();
  const result: SyncResult = { incidents: 0, photos: 0, errors: [] };

  // Sync profile
  const profile = await getProfile();
  if (profile) {
    const { error } = await supabase.from('user_profiles').upsert({
      user_id: userId,
      full_name: profile.fullName,
      email: profile.email,
      insurance_company: profile.insuranceCompany,
      policy_number: profile.policyNumber,
      vehicle_make: profile.vehicleMake,
      vehicle_model: profile.vehicleModel,
      vehicle_year: profile.vehicleYear,
      license_plate: profile.licensePlate,
      blood_type: profile.bloodType,
      medications: profile.medications,
      allergies: profile.allergies,
      emergency_contact_name: profile.emergencyContactName,
      emergency_contact_phone: profile.emergencyContactPhone,
    }, { onConflict: 'user_id' });
    if (error) result.errors.push(`Profile: ${error.message}`);
  }

  // Sync all incidents
  const incidents = await getAllIncidents();

  for (const incident of incidents) {
    // Upsert incident
    const { error: incErr } = await supabase.from('incidents').upsert({
      id: incident.id,
      user_id: userId,
      type: incident.type,
      created_at: +incident.createdAt,
      location_lat: incident.locationLat,
      location_lng: incident.locationLng,
      location_label: incident.locationLabel,
      status: incident.status,
      report_generated: incident.reportGenerated,
    }, { onConflict: 'id' });

    if (incErr) {
      result.errors.push(`Incident ${incident.id}: ${incErr.message}`);
      continue;
    }

    // Upsert steps
    const steps = await getIncidentSteps(incident.id);
    for (const step of steps) {
      await supabase.from('incident_steps').upsert({
        id: step.id,
        incident_id: incident.id,
        user_id: userId,
        step_key: step.stepKey,
        completed: step.completed,
        completed_at: step.completedAt ? +step.completedAt : null,
        data: step.data,
      }, { onConflict: 'id' });
    }

    // Upload photos
    const photos = await getIncidentPhotos(incident.id);
    for (const photo of photos) {
      if (photo.synced) continue;
      const { url, error: uploadErr } = await uploadPhoto(photo.uri, userId, photo.id);
      if (url) {
        await supabase.from('photos').upsert({
          id: photo.id,
          incident_id: incident.id,
          user_id: userId,
          storage_path: url,
          taken_at: +photo.takenAt,
          lat: photo.lat,
          lng: photo.lng,
          label: photo.label,
        }, { onConflict: 'id' });

        await db.write(async () => {
          await photo.update(p => { p.synced = true; });
        });
        result.photos++;
      } else {
        result.errors.push(`Photo ${photo.id}: ${uploadErr ?? 'upload failed'}`);
      }
    }

    // Mark incident synced
    await db.write(async () => {
      await incident.update(i => { i.synced = true; });
    });
    result.incidents++;
  }

  return result;
}
