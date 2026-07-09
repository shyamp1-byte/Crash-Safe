import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { RootStackParamList } from './types';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

import Home from '../screens/Home';
import CrashFlow from '../screens/CrashFlow';
import HitRunFlow from '../screens/HitRunFlow';
import VandalismFlow from '../screens/VandalismFlow';
import WeatherFlow from '../screens/WeatherFlow';
import IncidentHistory from '../screens/IncidentHistory';
import IncidentDetail from '../screens/IncidentHistory/IncidentDetail';
import ReportViewer from '../screens/Report/ReportViewer';
import Login from '../screens/Auth/Login';
import SignUp from '../screens/Auth/SignUp';
import UserProfile from '../screens/Profile/UserProfile';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="CrashFlow" component={CrashFlow} />
          <Stack.Screen name="HitRunFlow" component={HitRunFlow} />
          <Stack.Screen name="VandalismFlow" component={VandalismFlow} />
          <Stack.Screen name="WeatherFlow" component={WeatherFlow} />
          <Stack.Screen name="IncidentHistory" component={IncidentHistory} />
          <Stack.Screen name="IncidentDetail" component={IncidentDetail} />
          <Stack.Screen name="ReportViewer" component={ReportViewer} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
