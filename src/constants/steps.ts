export const CRASH_STEPS = [
  'safety_check',
  'location_capture',
  'your_vehicle_photos',
  'other_driver_info',
  'other_vehicle_photos',
  'witness_info',
  'police_report',
  'what_not_to_do',
  'notes',
  'generate_report',
] as const;

export const HIT_RUN_STEPS = [
  'location_capture',
  'damage_photos',
  'scene_photos',
  'camera_search',
  'witness_search',
  'police_report_guidance',
  'insurance_guidance',
  'notes',
  'generate_report',
] as const;

export type CrashStepKey = (typeof CRASH_STEPS)[number];
export type HitRunStepKey = (typeof HIT_RUN_STEPS)[number];
export type StepKey = CrashStepKey | HitRunStepKey;
