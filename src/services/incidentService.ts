import { getDatabase } from '../db';
import Incident from '../db/models/Incident';
import IncidentStep from '../db/models/IncidentStep';
import Photo from '../db/models/Photo';
import type { IncidentType } from '../db/models/Incident';
import type { LocationResult } from './location';
import * as FileSystem from 'expo-file-system/legacy';
import { Q } from '@nozbe/watermelondb';

export async function createIncident(type: IncidentType): Promise<Incident> {
  const db = getDatabase();
  return db.write(async () => {
    return db.get<Incident>('incidents').create(record => {
      record.type = type;
      record.status = 'in_progress';
      record.synced = false;
      record.reportGenerated = false;
      record.createdAt = new Date();
    });
  });
}

export async function updateIncidentLocation(
  incidentId: string,
  location: LocationResult,
): Promise<void> {
  const db = getDatabase();
  await db.write(async () => {
    const incident = await db.get<Incident>('incidents').find(incidentId);
    await incident.update(record => {
      record.locationLat = location.lat;
      record.locationLng = location.lng;
      record.locationLabel = location.label;
    });
  });
}

export async function saveStepData(
  incidentId: string,
  stepKey: string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = getDatabase();
  await db.write(async () => {
    const existing = await db
      .get<IncidentStep>('incident_steps')
      .query(Q.and(Q.where('incident_id', incidentId), Q.where('step_key', stepKey)))
      .fetch();
    const match = existing[0];
    if (match) {
      await match.update(record => {
        record.data = JSON.stringify(data);
        record.completed = true;
        record.completedAt = new Date();
      });
    } else {
      await db.get<IncidentStep>('incident_steps').create(record => {
        record.incidentId = incidentId;
        record.stepKey = stepKey;
        record.completed = true;
        record.data = JSON.stringify(data);
        record.completedAt = new Date();
      });
    }
  });
}

export async function addPhoto(
  incidentId: string,
  uri: string,
  label: string,
  lat: number | null,
  lng: number | null,
): Promise<Photo> {
  let persistentUri = uri;
  try {
    const docDir = FileSystem.documentDirectory;
    if (docDir) {
      const ext = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
      const filename = `photo_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const dest = docDir + filename;
      await FileSystem.copyAsync({ from: uri, to: dest });
      persistentUri = dest;
    }
  } catch {
    // keep original uri if copy fails
  }
  const db = getDatabase();
  return db.write(async () => {
    return db.get<Photo>('photos').create(record => {
      record.incidentId = incidentId;
      record.uri = persistentUri;
      record.label = label;
      record.lat = lat;
      record.lng = lng;
      record.synced = false;
      record.takenAt = new Date();
    });
  });
}

export async function markIncidentComplete(incidentId: string): Promise<void> {
  const db = getDatabase();
  await db.write(async () => {
    const incident = await db.get<Incident>('incidents').find(incidentId);
    await incident.update(record => {
      record.status = 'complete';
    });
  });
}

export async function getAllIncidents(): Promise<Incident[]> {
  const db = getDatabase();
  return db.get<Incident>('incidents').query().fetch();
}

// On dev, app container UUID changes each reinstall. Call this on any photo URI before use.
export function normalizePhotoUri(uri: string): string {
  const docDir = FileSystem.documentDirectory;
  if (!docDir) return uri;
  const match = docDir.match(/Containers\/Data\/Application\/([^/]+)\//);
  if (!match) return uri;
  const currentUUID = match[1];
  return uri.replace(/Containers\/Data\/Application\/([^/]+)\//, `Containers/Data/Application/${currentUUID}/`);
}

export async function deletePhoto(photoId: string): Promise<void> {
  const db = getDatabase();
  await db.write(async () => {
    const photo = await db.get<Photo>('photos').find(photoId);
    await photo.destroyPermanently();
  });
}

export async function getIncidentPhotos(incidentId: string): Promise<Photo[]> {
  const db = getDatabase();
  return db.get<Photo>('photos').query(Q.where('incident_id', incidentId)).fetch();
}

export async function getIncidentSteps(
  incidentId: string,
): Promise<IncidentStep[]> {
  const db = getDatabase();
  return db.get<IncidentStep>('incident_steps').query(Q.where('incident_id', incidentId)).fetch();
}

// ---------------------------------------------------------------------------
// User Profile
// ---------------------------------------------------------------------------
import UserProfile from '../db/models/UserProfile';

export interface ProfileData {
  fullName?: string;
  email?: string;
  insuranceCompany?: string;
  policyNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  licensePlate?: string;
  bloodType?: string;
  medications?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePicture?: string;
}

export async function getProfile(): Promise<UserProfile | null> {
  const db = getDatabase();
  const all = await db.get<UserProfile>('user_profile').query().fetch();
  return all[0] ?? null;
}

export async function saveProfile(data: ProfileData): Promise<UserProfile> {
  const db = getDatabase();
  const existing = await getProfile();
  return db.write(async () => {
    if (existing) {
      await existing.update(record => {
        record.fullName = data.fullName ?? null;
        record.email = data.email ?? null;
        record.insuranceCompany = data.insuranceCompany ?? null;
        record.policyNumber = data.policyNumber ?? null;
        record.vehicleMake = data.vehicleMake ?? null;
        record.vehicleModel = data.vehicleModel ?? null;
        record.vehicleYear = data.vehicleYear ?? null;
        record.licensePlate = data.licensePlate ?? null;
        record.bloodType = data.bloodType ?? null;
        record.medications = data.medications ?? null;
        record.allergies = data.allergies ?? null;
        record.emergencyContactName = data.emergencyContactName ?? null;
        record.emergencyContactPhone = data.emergencyContactPhone ?? null;
        record.profilePicture = data.profilePicture ?? null;
      });
      return existing;
    }
    return db.get<UserProfile>('user_profile').create(record => {
      record.fullName = data.fullName ?? null;
      record.email = data.email ?? null;
      record.insuranceCompany = data.insuranceCompany ?? null;
      record.policyNumber = data.policyNumber ?? null;
      record.vehicleMake = data.vehicleMake ?? null;
      record.vehicleModel = data.vehicleModel ?? null;
      record.vehicleYear = data.vehicleYear ?? null;
      record.licensePlate = data.licensePlate ?? null;
      record.bloodType = data.bloodType ?? null;
      record.medications = data.medications ?? null;
      record.allergies = data.allergies ?? null;
      record.emergencyContactName = data.emergencyContactName ?? null;
      record.emergencyContactPhone = data.emergencyContactPhone ?? null;
      record.profilePicture = data.profilePicture ?? null;
    });
  });
}
