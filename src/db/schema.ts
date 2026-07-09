import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'incidents',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'location_lat', type: 'number', isOptional: true },
        { name: 'location_lng', type: 'number', isOptional: true },
        { name: 'location_label', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'report_generated', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'incident_steps',
      columns: [
        { name: 'incident_id', type: 'string', isIndexed: true },
        { name: 'step_key', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'data', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'photos',
      columns: [
        { name: 'incident_id', type: 'string', isIndexed: true },
        { name: 'uri', type: 'string' },
        { name: 'taken_at', type: 'number' },
        { name: 'lat', type: 'number', isOptional: true },
        { name: 'lng', type: 'number', isOptional: true },
        { name: 'label', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'user_profile',
      columns: [
        { name: 'full_name', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'insurance_company', type: 'string', isOptional: true },
        { name: 'policy_number', type: 'string', isOptional: true },
        { name: 'vehicle_make', type: 'string', isOptional: true },
        { name: 'vehicle_model', type: 'string', isOptional: true },
        { name: 'vehicle_year', type: 'string', isOptional: true },
        { name: 'license_plate', type: 'string', isOptional: true },
        { name: 'blood_type', type: 'string', isOptional: true },
        { name: 'medications', type: 'string', isOptional: true },
        { name: 'allergies', type: 'string', isOptional: true },
        { name: 'emergency_contact_name', type: 'string', isOptional: true },
        { name: 'emergency_contact_phone', type: 'string', isOptional: true },
        { name: 'profile_picture', type: 'string', isOptional: true },
      ],
    }),
  ],
});
