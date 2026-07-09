import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import migrations from './migrations';
import Incident from './models/Incident';
import IncidentStep from './models/IncidentStep';
import Photo from './models/Photo';
import UserProfile from './models/UserProfile';

let _database: Database | null = null;

export function getDatabase(): Database {
  if (_database) return _database;

  const adapter = new SQLiteAdapter({
    schema,
    migrations,
    dbName: 'crashsafe',
    jsi: false,
  });

  _database = new Database({
    adapter,
    modelClasses: [Incident, IncidentStep, Photo, UserProfile],
  });

  return _database;
}

export { Incident, IncidentStep, Photo, UserProfile };
