import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/Splash/SplashScreen';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar style="auto" />
      <RootNavigator />
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
