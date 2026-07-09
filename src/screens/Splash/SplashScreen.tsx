import React, { useEffect, useRef } from 'react';
import { Modal, Animated, StyleSheet, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width, height) * 1.1;

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(0.94)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    // Slow, soft float-in — no bounce
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Long hold, then slow graceful fade out
    setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onFinish();
      });
    }, 2400);
  }, []);

  return (
    <Modal visible={visible} animationType="none" statusBarTranslucent transparent={false}>
      <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
        <Animated.Image
          source={require('../../../assets/logo.png')}
          style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
          resizeMode="contain"
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
