import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ExpoLocation from 'expo-location';
import { COLORS, SPACING, RADIUS, FONT } from '../constants/theme';

interface Suggestion {
  key: string;
  label: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  onSelect: (label: string, lat: number, lng: number) => void;
  placeholder?: string;
  style?: object;
}

function isRelevant(label: string, query: string): boolean {
  // Strip leading house number from query, check remaining words appear in result
  const stripped = query.replace(/^\d+\s+/, '').toLowerCase();
  const queryWords = stripped.split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return true;
  const labelLower = label.toLowerCase();
  const matched = queryWords.filter(w => labelLower.includes(w)).length;
  return matched >= Math.ceil(queryWords.length * 0.6);
}

function buildLabel(p: Record<string, string | number | undefined>): string {
  const parts: string[] = [];
  const street = [p.housenumber, p.street ?? p.name].filter(Boolean).join(' ');
  if (street) parts.push(String(street));
  if (p.city ?? p.town ?? p.village) parts.push(String(p.city ?? p.town ?? p.village));
  if (p.state) parts.push(String(p.state));
  if (p.postcode) parts.push(String(p.postcode));
  return parts.join(', ');
}

export default function AddressAutocomplete({ value, onChangeText, onSelect, placeholder, style }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 4) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);

      const houseMatch = q.match(/^(\d+)\s+/);
      const typedNumber = houseMatch ? houseMatch[1] : null;
      let results: Suggestion[] = [];

      // Step 1: Photon (OSM-based, fast)
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7&lang=en&countrycodes=us`;
        const timeoutId = setTimeout(() => abortRef.current?.abort(), 8000);
        const res = await fetch(url, {
          signal: abortRef.current.signal,
          headers: { 'User-Agent': 'CrashSafe/1.0' },
        });
        clearTimeout(timeoutId);
        const data = await res.json() as {
          features: Array<{
            geometry: { coordinates: [number, number] };
            properties: Record<string, string | number | undefined>;
          }>;
        };
        results = data.features
          .map((f, i) => {
            let label = buildLabel(f.properties);
            if (!label) return null;
            if (typedNumber && !label.startsWith(typedNumber)) {
              label = `${typedNumber} ${label}`;
            }
            return {
              key: `photon-${i}`,
              label,
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
            };
          })
          .filter((s): s is Suggestion => s !== null)
          .filter(s => isRelevant(s.label, q))
          .filter((s, i, arr) => arr.findIndex(x => x.label === s.label) === i);
      } catch {
        // network error or aborted — fall through to Apple
      }

      // Step 2: Apple geocoder fallback — full US coverage including house numbers
      if (results.length === 0) {
        try {
          const appleGeo = await ExpoLocation.geocodeAsync(q);
          const appleList = await Promise.all(
            appleGeo.slice(0, 5).map(async (r, i) => {
              const rev = await ExpoLocation.reverseGeocodeAsync({
                latitude: r.latitude,
                longitude: r.longitude,
              });
              const p = rev[0];
              const parts = [p?.streetNumber, p?.street, p?.city, p?.region, p?.postalCode].filter(Boolean);
              return {
                key: `apple-${i}`,
                label: parts.length >= 2 ? parts.join(', ') : q,
                lat: r.latitude,
                lng: r.longitude,
              };
            })
          );
          results = appleList
            .filter(s => isRelevant(s.label, q))
            .filter((s, i, arr) => arr.findIndex(x => x.label === s.label) === i);
        } catch {
          // geocoding unavailable
        }
      }

      setSuggestions(results);
      setOpen(results.length > 0);
      setLoading(false);
    }, 300);
  }, [value]);

  const handleSelect = (s: Suggestion) => {
    setSuggestions([]);
    setOpen(false);
    onChangeText(s.label);
    onSelect(s.label, s.lat, s.lng);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? 'Start typing address…'}
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading && (
          <ActivityIndicator style={styles.spinner} size="small" color={COLORS.primary} />
        )}
      </View>

      {/* Inline list — avoids ScrollView clipping absolute-positioned children on iOS */}
      {open && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((item, i) => (
            <React.Fragment key={item.key}>
              {i > 0 && <View style={styles.separator} />}
              <TouchableOpacity style={styles.suggestion} onPress={() => handleSelect(item)}>
                <Text style={styles.suggestionIcon}>📍</Text>
                <Text style={styles.suggestionText} numberOfLines={2}>{item.label}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 99 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT.body,
    color: COLORS.text,
  },
  spinner: { marginLeft: SPACING.sm },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    overflow: 'hidden',
  },
  separator: { height: 1, backgroundColor: COLORS.border },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  suggestionIcon: { fontSize: 14, marginTop: 2 },
  suggestionText: { flex: 1, fontSize: FONT.body, color: COLORS.text, lineHeight: 20 },
});
