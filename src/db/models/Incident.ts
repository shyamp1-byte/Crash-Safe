import { Model, Q } from '@nozbe/watermelondb';

export type IncidentType = 'crash' | 'hit_and_run' | 'vandalism' | 'weather_damage';
export type IncidentStatus = 'in_progress' | 'complete';

export default class Incident extends Model {
  static table = 'incidents';

  static associations = {
    incident_steps: { type: 'has_many' as const, foreignKey: 'incident_id' },
    photos: { type: 'has_many' as const, foreignKey: 'incident_id' },
  };

  get type(): IncidentType { return this._getRaw('type') as IncidentType; }
  set type(v: IncidentType) { this._setRaw('type', v); }

  get createdAt(): Date { return new Date((this._getRaw('created_at') as number) || Date.now()); }
  set createdAt(v: Date) { this._setRaw('created_at', +v); }

  get locationLat(): number | null { return this._getRaw('location_lat') as number | null; }
  set locationLat(v: number | null) { this._setRaw('location_lat', v); }

  get locationLng(): number | null { return this._getRaw('location_lng') as number | null; }
  set locationLng(v: number | null) { this._setRaw('location_lng', v); }

  get locationLabel(): string | null { return this._getRaw('location_label') as string | null; }
  set locationLabel(v: string | null) { this._setRaw('location_label', v); }

  get status(): IncidentStatus { return this._getRaw('status') as IncidentStatus; }
  set status(v: IncidentStatus) { this._setRaw('status', v); }

  get synced(): boolean { return !!(this._getRaw('synced')); }
  set synced(v: boolean) { this._setRaw('synced', v ? 1 : 0); }

  get reportGenerated(): boolean { return !!(this._getRaw('report_generated')); }
  set reportGenerated(v: boolean) { this._setRaw('report_generated', v ? 1 : 0); }
}
