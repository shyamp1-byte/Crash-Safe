export type RootStackParamList = {
  Home: undefined;
  CrashFlow: undefined;
  HitRunFlow: undefined;
  VandalismFlow: undefined;
  WeatherFlow: undefined;
  IncidentHistory: undefined;
  IncidentDetail: { incidentId: string };
  ReportViewer: { incidentId: string };
  Login: undefined;
  SignUp: undefined;
  UserProfile: undefined;
};

export type VandalismStackParamList = {
  FirstSteps: undefined;
  LocationCapture: undefined;
  DamagePhotos: undefined;
  ScenePhotos: undefined;
  PoliceReport: undefined;
  InsuranceGuidance: undefined;
  Notes: undefined;
  GenerateReport: undefined;
};

export type WeatherStackParamList = {
  FirstSteps: undefined;
  LocationCapture: undefined;
  DamagePhotos: undefined;
  ScenePhotos: undefined;
  InsuranceGuidance: undefined;
  Notes: undefined;
  GenerateReport: undefined;
};

export type CrashStackParamList = {
  SafetyCheck: undefined;
  LocationCapture: undefined;
  YourVehiclePhotos: undefined;
  OtherDriverInfo: undefined;
  OtherVehiclePhotos: undefined;
  WitnessInfo: undefined;
  PoliceReport: undefined;
  WhatNotToDo: undefined;
  Notes: undefined;
  GenerateReport: undefined;
};

export type HitRunStackParamList = {
  LocationCapture: undefined;
  DamagePhotos: undefined;
  ScenePhotos: undefined;
  CameraSearch: undefined;
  WitnessSearch: undefined;
  PoliceReportGuidance: undefined;
  InsuranceGuidance: undefined;
  Notes: undefined;
  GenerateReport: undefined;
};
