import { Model } from '@nozbe/watermelondb';

export default class UserProfile extends Model {
  static table = 'user_profile';

  get fullName(): string | null { return this._getRaw('full_name') as string | null; }
  set fullName(v: string | null) { this._setRaw('full_name', v); }

  get email(): string | null { return this._getRaw('email') as string | null; }
  set email(v: string | null) { this._setRaw('email', v); }

  get insuranceCompany(): string | null { return this._getRaw('insurance_company') as string | null; }
  set insuranceCompany(v: string | null) { this._setRaw('insurance_company', v); }

  get policyNumber(): string | null { return this._getRaw('policy_number') as string | null; }
  set policyNumber(v: string | null) { this._setRaw('policy_number', v); }

  get vehicleMake(): string | null { return this._getRaw('vehicle_make') as string | null; }
  set vehicleMake(v: string | null) { this._setRaw('vehicle_make', v); }

  get vehicleModel(): string | null { return this._getRaw('vehicle_model') as string | null; }
  set vehicleModel(v: string | null) { this._setRaw('vehicle_model', v); }

  get vehicleYear(): string | null { return this._getRaw('vehicle_year') as string | null; }
  set vehicleYear(v: string | null) { this._setRaw('vehicle_year', v); }

  get licensePlate(): string | null { return this._getRaw('license_plate') as string | null; }
  set licensePlate(v: string | null) { this._setRaw('license_plate', v); }

  get bloodType(): string | null { return this._getRaw('blood_type') as string | null; }
  set bloodType(v: string | null) { this._setRaw('blood_type', v); }

  get medications(): string | null { return this._getRaw('medications') as string | null; }
  set medications(v: string | null) { this._setRaw('medications', v); }

  get allergies(): string | null { return this._getRaw('allergies') as string | null; }
  set allergies(v: string | null) { this._setRaw('allergies', v); }

  get emergencyContactName(): string | null { return this._getRaw('emergency_contact_name') as string | null; }
  set emergencyContactName(v: string | null) { this._setRaw('emergency_contact_name', v); }

  get emergencyContactPhone(): string | null { return this._getRaw('emergency_contact_phone') as string | null; }
  set emergencyContactPhone(v: string | null) { this._setRaw('emergency_contact_phone', v); }

  get profilePicture(): string | null { return this._getRaw('profile_picture') as string | null; }
  set profilePicture(v: string | null) { this._setRaw('profile_picture', v); }
}
