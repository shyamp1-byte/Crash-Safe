import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../constants/theme';
import { formatDateTime } from '../utils/timestamp';
import type Incident from '../db/models/Incident';

interface Props {
  incident: Incident;
  onPress: () => void;
}

const TYPE_CONFIG = {
  crash:          { icon: '🚨', label: 'Vehicle Crash',    color: COLORS.red,      bg: COLORS.redLight },
  hit_and_run:    { icon: '🚗', label: 'Hit & Run',        color: COLORS.brandMid, bg: COLORS.brandLight },
  vandalism:      { icon: '🔨', label: 'Vandalism',         color: COLORS.purple,   bg: COLORS.purpleLight },
  weather_damage: { icon: '🌪️', label: 'Weather Damage',   color: COLORS.teal,     bg: COLORS.tealLight },
};

export default function IncidentCard({ incident, onPress }: Props) {
  const config = TYPE_CONFIG[incident.type] ?? TYPE_CONFIG.crash;
  const isComplete = incident.status === 'complete';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{config.label}</Text>
          <View style={[styles.badge, isComplete ? styles.badgeComplete : styles.badgeProgress]}>
            <Text style={[styles.badgeText, isComplete ? styles.badgeTextComplete : styles.badgeTextProgress]}>
              {isComplete ? 'Complete' : 'In Progress'}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDateTime(incident.createdAt.getTime())}</Text>
        {incident.locationLabel ? (
          <Text style={styles.location} numberOfLines={1}>📍 {incident.locationLabel}</Text>
        ) : null}
      </View>

      <Text style={[styles.chevron, { color: config.color }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  iconWrap: {
    width: 50, height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  body: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: {
    flex: 1,
    fontSize: FONT.body,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeComplete: { backgroundColor: COLORS.successLight },
  badgeProgress: { backgroundColor: COLORS.brandLight },
  badgeText: { fontSize: 11, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  badgeTextComplete: { color: COLORS.success },
  badgeTextProgress: { color: COLORS.brandMid },
  date: { fontSize: FONT.caption, color: COLORS.textMuted },
  location: { fontSize: FONT.caption, color: COLORS.textSecondary, marginTop: 1 },
  chevron: { fontSize: 24, fontFamily: 'Poppins_400Regular', fontWeight: '300' },
});
