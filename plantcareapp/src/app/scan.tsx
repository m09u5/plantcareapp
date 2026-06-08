import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { identifyPlantFromPhoto } from '@/components/plants/plant-scanner';
import { Fonts } from '@/constants/theme';
import { useScannedPlant } from '@/context/scanned-plant';

const accentColor = '#00d47a';

export default function ScanScreen() {
  const { setPendingDraft } = useScannedPlant();
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  async function scanFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setError('Pozwol aplikacji uzyc aparatu, zeby zrobic zdjecie rosliny.');
      return;
    }

    await scanPhoto(() =>
      ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [184, 127],
        base64: true,
        mediaTypes: ['images'],
        quality: 0.55,
      }),
    );
  }

  async function scanFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Pozwol aplikacji otworzyc galerie, zeby wybrac zdjecie rosliny.');
      return;
    }

    await scanPhoto(() =>
      ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [184, 127],
        base64: true,
        mediaTypes: ['images'],
        quality: 0.55,
      }),
    );
  }

  async function scanPhoto(
    openPicker: () => Promise<ImagePicker.ImagePickerResult>,
  ) {
    setError(null);
    setIsScanning(true);

    try {
      const result = await openPicker();

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.base64) {
        setError('Nie udalo sie odczytac tego zdjecia.');
        return;
      }

      const mimeType = asset.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg';
      const imageUrl = `data:${mimeType};base64,${asset.base64}`;
      const draft = await identifyPlantFromPhoto(asset.base64, imageUrl);

      setPendingDraft(draft);
      router.push('/');
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Nie udalo sie zeskanowac rosliny.');
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Scan :</Text>

      <View style={styles.scanPanel}>
        <View style={styles.scanIconWrap}>
          {isScanning ? (
            <ActivityIndicator color={accentColor} size="large" />
          ) : (
            <Feather color={accentColor} name="maximize" size={38} />
          )}
        </View>

        <Text style={styles.scanStatus}>
          {isScanning ? 'Model sprawdza zdjecie...' : 'Wybierz zdjecie rosliny'}
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isScanning}
            onPress={scanFromCamera}
            style={({ pressed }) => [
              styles.actionButton,
              isScanning && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Feather color="#111111" name="camera" size={20} />
            <Text style={styles.actionText}>Camera</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isScanning}
            onPress={scanFromGallery}
            style={({ pressed }) => [
              styles.actionButton,
              isScanning && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Feather color="#111111" name="image" size={20} />
            <Text style={styles.actionText}>Gallery</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 112,
  },
  screenTitle: {
    color: '#000000',
    fontFamily: Fonts.mono,
    fontSize: 22,
    letterSpacing: 0,
  },
  scanPanel: {
    alignItems: 'center',
    marginTop: 54,
  },
  scanIconWrap: {
    alignItems: 'center',
    borderColor: '#b9b9b9',
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 118,
    justifyContent: 'center',
    width: 118,
  },
  scanStatus: {
    color: '#111111',
    fontFamily: Fonts.mono,
    fontSize: 15,
    marginTop: 22,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    alignItems: 'center',
    borderColor: '#dcdcdc',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#111111',
    fontFamily: Fonts.mono,
    fontSize: 13,
  },
  disabled: {
    opacity: 0.52,
  },
  errorText: {
    color: '#9f2f1f',
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 20,
    maxWidth: 310,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
