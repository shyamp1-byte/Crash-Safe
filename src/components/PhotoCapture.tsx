import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, FONT } from '../constants/theme';
import { generateId } from '../utils/uuid';

export interface PhotoItem {
  id: string;
  uri: string;
}

interface Props {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  label?: string;
  hint?: string;
  maxPhotos?: number;
}

export default function PhotoCapture({
  photos,
  onPhotosChange,
  label,
  hint,
  maxPhotos = 20,
}: Props) {
  const handleAdd = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit reached', `Maximum ${maxPhotos} photos.`);
      return;
    }
    Alert.alert('Add Photo', '', [
      { text: 'Take Photo', onPress: launchCamera },
      { text: 'Choose from Library', onPress: launchLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Camera access is required to take photos.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      exif: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      onPhotosChange([...photos, { id: generateId(), uri: asset.uri }]);
    }
  };

  const launchLibrary = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Photo library access is required to choose photos.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: maxPhotos - photos.length,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map(a => ({
        id: generateId(),
        uri: a.uri,
      }));
      onPhotosChange([...photos, ...newPhotos]);
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove photo?', '', [
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => onPhotosChange(photos.filter(p => p.id !== id)),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleReplace = (id: string) => {
    Alert.alert('Photo', '', [
      { text: 'Replace', onPress: () => launchReplaceLibrary(id) },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => onPhotosChange(photos.filter(p => p.id !== id)),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const launchReplaceLibrary = async (id: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      onPhotosChange(photos.map(p =>
        p.id === id ? { id, uri: result.assets[0].uri } : p,
      ));
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <FlatList
        data={[...photos, { id: '__add__', uri: '' }]}
        numColumns={2}
        scrollEnabled={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          if (item.id === '__add__') {
            return (
              <TouchableOpacity
                style={styles.addTile}
                onPress={handleAdd}
                activeOpacity={0.7}
              >
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addText}>Add Photo</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              style={styles.photoTile}
              onPress={() => handleReplace(item.id)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.uri }} style={styles.photo} />
              <View style={styles.removeButton}>
                <Text style={styles.removeIcon}>✎</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const TILE_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: FONT.bodyLg,
    fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: FONT.label,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  grid: {
    gap: SPACING.sm,
  },
  photoTile: {
    flex: 1,
    margin: SPACING.xs,
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    maxWidth: TILE_SIZE,
    backgroundColor: COLORS.border,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 18,
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
  },
  addTile: {
    flex: 1,
    margin: SPACING.xs,
    aspectRatio: 1,
    maxWidth: TILE_SIZE,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  addIcon: {
    fontSize: 32,
    color: COLORS.primary,
    lineHeight: 36,
  },
  addText: {
    fontSize: FONT.label,
    color: COLORS.primary,
    fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    marginTop: SPACING.xs,
  },
});
