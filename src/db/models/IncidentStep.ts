import { Model } from '@nozbe/watermelondb';

export default class IncidentStep extends Model {
  static table = 'incident_steps';

  static associations = {
    incidents: { type: 'belongs_to' as const, key: 'incident_id' },
  };

  get incidentId(): string { return this._getRaw('incident_id') as string; }
  set incidentId(v: string) { this._setRaw('incident_id', v); }

  get stepKey(): string { return this._getRaw('step_key') as string; }
  set stepKey(v: string) { this._setRaw('step_key', v); }

  get completed(): boolean { return !!(this._getRaw('completed')); }
  set completed(v: boolean) { this._setRaw('completed', v ? 1 : 0); }

  get completedAt(): Date | null {
    const raw = this._getRaw('completed_at') as number | null;
    return raw ? new Date(raw) : null;
  }
  set completedAt(v: Date | null) { this._setRaw('completed_at', v ? +v : null); }

  get data(): string | null { return this._getRaw('data') as string | null; }
  set data(v: string | null) { this._setRaw('data', v); }
}
