import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONT } from '../constants/theme';

interface Props {
  title: string;
  step: number;
  total: number;
  onBack?: () => void;
}

export default function StepHeader({ title, step, total, onBack }: Props) {
  const progress = step / total;
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.slot} />
        )}

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.slot}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{step}<Text style={styles.pillTotal}> / {total}</Text></Text>
          </View>
        </View>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 36,
    fontFamily: 'Poppins_400Regular', fontWeight: '300',
  },
  slot: {
    width: 56,
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT.body,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: FONT.caption,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: '#FFFFFF',
  },
  pillTotal: {
    fontFamily: 'Poppins_400Regular', fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  fill: {
    height: '100%',
    backgroundColor: '#F5A623',
    borderRadius: 2,
  },
});
