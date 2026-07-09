import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WeatherStackParamList } from '../../navigation/types';

import FirstSteps from './steps/FirstSteps';
import LocationCapture from './steps/LocationCapture';
import DamagePhotos from './steps/DamagePhotos';
import ScenePhotos from './steps/ScenePhotos';
import InsuranceGuidance from './steps/InsuranceGuidance';
import Notes from './steps/Notes';
import GenerateReport from './steps/GenerateReport';

const Stack = createNativeStackNavigator<WeatherStackParamList>();

export default function WeatherFlow() {
  return (
    <Stack.Navigator
      initialRouteName="FirstSteps"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="FirstSteps" component={FirstSteps} />
      <Stack.Screen name="LocationCapture" component={LocationCapture} />
      <Stack.Screen name="DamagePhotos" component={DamagePhotos} />
      <Stack.Screen name="ScenePhotos" component={ScenePhotos} />
      <Stack.Screen name="InsuranceGuidance" component={InsuranceGuidance} />
      <Stack.Screen name="Notes" component={Notes} />
      <Stack.Screen name="GenerateReport" component={GenerateReport} />
    </Stack.Navigator>
  );
}
