import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  Alert, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../constants/theme';
import { createIncident, getProfile } from '../services/incidentService';
import { useIncidentStore } from '../store/incidentStore';
import * as FileSystem from 'expo-file-system/legacy';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type IncidentTypeKey = 'crash' | 'hit_and_run' | 'vandalism' | 'weather_damage';

const INCIDENT_TYPES: Array<{
  key: IncidentTypeKey;
  icon: string;
  title: string;
  description: string;
  bg: string;
  bgDeep: string;
  nav: keyof RootStackParamList;
}> = [
  {
    key: 'crash',
    icon: '🚨',
    title: 'Vehicle Crash',
    description: 'Collision with another vehicle or object',
    bg: COLORS.red,
    bgDeep: COLORS.redDark,
    nav: 'CrashFlow',
  },
  {
    key: 'hit_and_run',
    icon: '🚗',
    title: 'Hit & Run',
    description: 'Your parked car was hit and driver fled',
    bg: COLORS.brandMid,
    bgDeep: COLORS.brand,
    nav: 'HitRunFlow',
  },
  {
    key: 'vandalism',
    icon: '🔨',
    title: 'Vandalism',
    description: 'Keyed, broken windows, graffiti, slashed tires',
    bg: COLORS.purple,
    bgDeep: COLORS.purpleDark,
    nav: 'VandalismFlow',
  },
  {
    key: 'weather_damage',
    icon: '🌪️',
    title: 'Weather Damage',
    description: 'Hail, fallen tree, flood, or storm damage',
    bg: COLORS.teal,
    bgDeep: COLORS.tealDark,
    nav: 'WeatherFlow',
  },
];

export default function Home({ navigation }: Props) {
  const [starting, setStarting] = useState<IncidentTypeKey | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const { startIncident } = useIncidentStore();

  useFocusEffect(
    useCallback(() => {
      getProfile().then(p => {
        const pic = p?.profilePicture;
        setProfilePicture(pic ? `${FileSystem.documentDirectory}${pic}` : null);
        setProfileIncomplete(!p || !p.fullName || !p.insuranceCompany || !p.policyNumber);
      }).catch(() => {});
    }, []),
  );

  const handleIncident = async (type: IncidentTypeKey, nav: keyof RootStackParamList) => {
    setStarting(type);
    try {
      const incident = await createIncident(type as Parameters<typeof createIncident>[0]);
      startIncident(incident.id, type as Parameters<typeof startIncident>[1]);
      navigation.navigate(nav as never);
    } catch {
      Alert.alert('Error', 'Could not start incident. Please try again.');
    } finally {
      setStarting(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLogo}>CrashSafe</Text>
            <Text style={styles.heroSub}>DOCUMENT  ·  PROTECT  ·  RECOVER</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('UserProfile')}
            disabled={starting !== null}
          >
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>P</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.heroPrompt}>What happened?</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile banner */}
        {profileIncomplete && (
          <TouchableOpacity
            style={styles.banner}
            onPress={() => navigation.navigate('UserProfile')}
            activeOpacity={0.88}
          >
            <Text style={styles.bannerIcon}>⚠️</Text>
            <View style={styles.bannerBody}>
              <Text style={styles.bannerTitle}>Complete your profile</Text>
              <Text style={styles.bannerSub}>Insurance info auto-fills your crash reports</Text>
            </View>
            <Text style={styles.bannerChevron}>›</Text>
          </TouchableOpacity>
        )}

        {/* Incident type cards */}
        <View style={styles.cards}>
          {INCIDENT_TYPES.map(type => (
            <TouchableOpacity
              key={type.key}
              style={[styles.card, { backgroundColor: type.bg }]}
              onPress={() => handleIncident(type.key, type.nav)}
              activeOpacity={0.86}
              disabled={starting !== null}
            >
              <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(0,0,0,0.18)' }]}>
                {starting === type.key
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.cardIcon}>{type.icon}</Text>
                }
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{type.title}</Text>
                <Text style={styles.cardDesc}>{type.description}</Text>
              </View>
              <Text style={styles.cardChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History */}
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('IncidentHistory')}
          disabled={starting !== null}
          activeOpacity={0.85}
        >
          <View style={styles.historyIconWrap}>
            <Text style={styles.historyIcon}>📋</Text>
          </View>
          <Text style={styles.historyText}>View Incident History</Text>
          <Text style={styles.historyChevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.brand },

  // Hero
  hero: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: SPACING.sm,
  },
  heroLogo: {
    fontSize: 30,
    fontFamily: 'Poppins_900Black', fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  heroSub: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    marginTop: 3,
  },
  avatarBtn: { marginTop: 4 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarFallback: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 16, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: 'rgba(255,255,255,0.6)',
  },
  heroPrompt: {
    fontSize: FONT.display,
    fontFamily: 'Poppins_800ExtraBold', fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: SPACING.lg,
  },

  // Scroll
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.md },

  // Banner
  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.amberLight,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: '#FDE68A',
    padding: SPACING.md, gap: SPACING.sm,
  },
  bannerIcon: { fontSize: 18 },
  bannerBody: { flex: 1 },
  bannerTitle: { fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#92400E' },
  bannerSub: { fontSize: FONT.caption, color: '#B45309', marginTop: 2 },
  bannerChevron: { fontSize: 22, color: '#D97706', fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  // Cards
  cards: { gap: SPACING.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOW.md,
  },
  cardIconWrap: {
    width: 52, height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  cardIcon: { fontSize: 26 },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: {
    fontSize: FONT.bodyLg,
    fontFamily: 'Poppins_800ExtraBold', fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: FONT.caption,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 17,
  },
  cardChevron: {
    fontSize: 26, color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins_400Regular', fontWeight: '300',
  },

  // History
  historyBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md, gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  historyIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center', justifyContent: 'center',
  },
  historyIcon: { fontSize: 20 },
  historyText: {
    flex: 1, fontSize: FONT.body, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.brand,
  },
  historyChevron: { fontSize: 20, color: COLORS.textMuted },
});
