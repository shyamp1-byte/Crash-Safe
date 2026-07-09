import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CrashStackParamList } from '../../navigation/types';

import SafetyCheck from './steps/SafetyCheck';
import LocationCapture from './steps/LocationCapture';
import YourVehiclePhotos from './steps/YourVehiclePhotos';
import OtherDriverInfo from './steps/OtherDriverInfo';
import OtherVehiclePhotos from './steps/OtherVehiclePhotos';
import WitnessInfo from './steps/WitnessInfo';
import PoliceReport from './steps/PoliceReport';
import WhatNotToDo from './steps/WhatNotToDo';
import Notes from './steps/Notes';
import GenerateReport from './steps/GenerateReport';

const Stack = createNativeStackNavigator<CrashStackParamList>();

export default function CrashFlow() {
  return (
    <Stack.Navigator
      initialRouteName="SafetyCheck"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="SafetyCheck" component={SafetyCheck} />
      <Stack.Screen name="LocationCapture" component={LocationCapture} />
      <Stack.Screen name="YourVehiclePhotos" component={YourVehiclePhotos} />
      <Stack.Screen name="OtherDriverInfo" component={OtherDriverInfo} />
      <Stack.Screen name="OtherVehiclePhotos" component={OtherVehiclePhotos} />
      <Stack.Screen name="WitnessInfo" component={WitnessInfo} />
      <Stack.Screen name="PoliceReport" component={PoliceReport} />
      <Stack.Screen name="WhatNotToDo" component={WhatNotToDo} />
      <Stack.Screen name="Notes" component={Notes} />
      <Stack.Screen name="GenerateReport" component={GenerateReport} />
    </Stack.Navigator>
  );
}
