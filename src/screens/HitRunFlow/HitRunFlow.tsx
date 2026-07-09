import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HitRunStackParamList } from '../../navigation/types';

import LocationCapture from './steps/LocationCapture';
import DamagePhotos from './steps/DamagePhotos';
import ScenePhotos from './steps/ScenePhotos';
import CameraSearch from './steps/CameraSearch';
import WitnessSearch from './steps/WitnessSearch';
import PoliceReportGuidance from './steps/PoliceReportGuidance';
import InsuranceGuidance from './steps/InsuranceGuidance';
import Notes from './steps/Notes';
import GenerateReport from './steps/GenerateReport';

const Stack = createNativeStackNavigator<HitRunStackParamList>();

export default function HitRunFlow() {
  return (
    <Stack.Navigator
      initialRouteName="LocationCapture"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="LocationCapture" component={LocationCapture} />
      <Stack.Screen name="DamagePhotos" component={DamagePhotos} />
      <Stack.Screen name="ScenePhotos" component={ScenePhotos} />
      <Stack.Screen name="CameraSearch" component={CameraSearch} />
      <Stack.Screen name="WitnessSearch" component={WitnessSearch} />
      <Stack.Screen name="PoliceReportGuidance" component={PoliceReportGuidance} />
      <Stack.Screen name="InsuranceGuidance" component={InsuranceGuidance} />
      <Stack.Screen name="Notes" component={Notes} />
      <Stack.Screen name="GenerateReport" component={GenerateReport} />
    </Stack.Navigator>
  );
}
