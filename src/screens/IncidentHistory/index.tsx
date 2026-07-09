import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import IncidentCard from '../../components/IncidentCard';
import { getAllIncidents } from '../../services/incidentService';
import { COLORS, SPACING, RADIUS, FONT } from '../../constants/theme';
import type Incident from '../../db/models/Incident';

type Props = NativeStackScreenProps<RootStackParamList, 'IncidentHistory'>;

export default function IncidentHistory({ navigation }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        try {
          const records = await getAllIncidents();
          const sorted = [...records].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          );
          if (active) setIncidents(sorted);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Incident History</Text>
        <View style={styles.slot} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.brand} />
        </View>
      ) : incidents.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Text style={styles.emptyIcon}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>No incidents yet</Text>
          <Text style={styles.emptyText}>
            Your documented incidents will appear here.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.emptyBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <IncidentCard
              incident={item}
              onPress={() => navigation.navigate('IncidentDetail', { incidentId: item.id })}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 32, color: '#FFF', fontFamily: 'Poppins_400Regular', fontWeight: '300', lineHeight: 36 },
  title: {
    flex: 1,
    fontSize: FONT.body,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  slot: { width: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyIconWrap: {
    width: 88, height: 88,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: {
    fontSize: FONT.heading,
    fontFamily: 'Poppins_800ExtraBold', fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: FONT.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.brand,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
  },
  emptyBtnText: { color: '#FFF', fontSize: FONT.body, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  list: { flex: 1 },
  listContent: { padding: SPACING.lg, gap: SPACING.sm },
});
