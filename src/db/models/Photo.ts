import { Model } from '@nozbe/watermelondb';

export default class Photo extends Model {
  static table = 'photos';

  static associations = {
    incidents: { type: 'belongs_to' as const, key: 'incident_id' },
  };

  get incidentId(): string { return this._getRaw('incident_id') as string; }
  set incidentId(v: string) { this._setRaw('incident_id', v); }

  get uri(): string { return this._getRaw('uri') as string; }
  set uri(v: string) { this._setRaw('uri', v); }

  get takenAt(): Date { return new Date((this._getRaw('taken_at') as number) || Date.now()); }
  set takenAt(v: Date) { this._setRaw('taken_at', +v); }

  get lat(): number | null { return this._getRaw('lat') as number | null; }
  set lat(v: number | null) { this._setRaw('lat', v); }

  get lng(): number | null { return this._getRaw('lng') as number | null; }
  set lng(v: number | null) { this._setRaw('lng', v); }

  get label(): string | null { return this._getRaw('label') as string | null; }
  set label(v: string | null) { this._setRaw('label', v); }

  get synced(): boolean { return !!(this._getRaw('synced')); }
  set synced(v: boolean) { this._setRaw('synced', v ? 1 : 0); }
}
