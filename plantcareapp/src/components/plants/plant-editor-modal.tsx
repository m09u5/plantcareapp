import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { IntervalSlider } from './interval-slider';
import { PlantPhoto } from './plant-photo';
import type { DraftPlant } from './plant-types';

const accentColor = '#00d47a';
const modalWidth = 350;
const waterBlue = '#00bfff';

export function PlantEditorModal({
  draft,
  onClose,
  onDelete,
  onSave,
}: {
  draft: DraftPlant | null;
  onClose: () => void;
  onDelete: (draft: DraftPlant) => void;
  onSave: (draft: DraftPlant) => void;
}) {
  const [localDraft, setLocalDraft] = useState<DraftPlant | null>(draft);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    setLocalDraft(draft);
    setImageError(null);
  }, [draft]);

  if (!localDraft) {
    return null;
  }

  async function pickPlantImage() {
    setImageError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setImageError('Allow gallery access to add a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [184, 127],
      base64: true,
      mediaTypes: ['images'],
      quality: 0.45,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset?.base64) {
      setImageError('Could not read this photo.');
      return;
    }

    const mimeType = asset.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg';
    setLocalDraft((current) =>
      current ? { ...current, imageUrl: `data:${mimeType};base64,${asset.base64}` } : current,
    );
  }

  function removePlantImage() {
    setImageError(null);
    setLocalDraft((current) => (current ? { ...current, imageUrl: null } : current));
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={Boolean(draft)}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard}>
          <Text style={styles.modalDot}>•</Text>
          <TextInput
            onChangeText={(name) => setLocalDraft((current) => (current ? { ...current, name } : current))}
            style={[styles.modalTitle, Platform.OS === 'web' && styles.webInputNoOutline]}
            value={localDraft.name}
          />

          <View style={styles.modalMainRow}>
            <View style={styles.modalImageColumn}>
              <Pressable
                accessibilityRole="button"
                onPress={pickPlantImage}
                style={({ pressed }) => [pressed && styles.pressed]}>
                <PlantPhoto imageUrl={localDraft.imageUrl} style={styles.modalImageBox} />
              </Pressable>
              {localDraft.imageUrl ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={removePlantImage}
                  style={styles.photoRemoveButton}>
                  <Feather color="#777777" name="x" size={14} />
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={pickPlantImage}
                  style={styles.photoActionButton}>
                  <Text style={styles.photoActionText}>Add photo</Text>
                </Pressable>
              )}
              {imageError ? <Text style={styles.photoErrorText}>{imageError}</Text> : null}
            </View>

            <View style={styles.noteColumn}>
              <Text style={styles.noteLabel}>Note:</Text>
              <TextInput
                multiline
                onChangeText={(note) => setLocalDraft((current) => (current ? { ...current, note } : current))}
                placeholder="Add note"
                placeholderTextColor="#b8b8b8"
                style={[styles.noteInput, Platform.OS === 'web' && styles.webInputNoOutline]}
                textAlignVertical="top"
                value={localDraft.note}
              />
            </View>
          </View>

          <View style={styles.sliderRow}>
            <Feather color={waterBlue} name="droplet" size={28} />
            <IntervalSlider
              interval={localDraft.interval}
              onChange={(interval) => setLocalDraft((current) => (current ? { ...current, interval } : current))}
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSave(localDraft)}
              style={({ pressed }) => [styles.checkButton, pressed && styles.pressed]}>
              <Feather color={accentColor} name="check" size={42} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onDelete(localDraft)}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
              <Feather color="#666666" name="trash-2" size={18} />
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const webInputNoOutline = { outlineStyle: 'none' } as never;

const styles = StyleSheet.create({
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    elevation: 10,
    minHeight: 356,
    paddingHorizontal: 18,
    paddingTop: 11,
    shadowColor: '#6f777b',
    shadowOffset: { width: 3, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    width: modalWidth,
  },
  modalDot: {
    color: '#777777',
    fontFamily: Fonts.mono,
    fontSize: 30,
    left: 14,
    lineHeight: 28,
    position: 'absolute',
    top: 4,
  },
  modalTitle: {
    color: '#000000',
    fontFamily: Fonts.mono,
    fontSize: 17,
    height: 30,
    marginBottom: 4,
    padding: 0,
    textAlign: 'center',
  },
  modalMainRow: {
    flexDirection: 'row',
    gap: 17,
  },
  modalImageColumn: {
    position: 'relative',
    width: 184,
  },
  modalImageBox: {
    height: 127,
    width: 184,
  },
  photoActionButton: {
    alignItems: 'center',
    borderColor: '#d3d3d3',
    borderRadius: 4,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    marginTop: 8,
  },
  photoActionText: {
    color: '#555555',
    fontFamily: Fonts.mono,
    fontSize: 11,
  },
  photoRemoveButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 14,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 6,
    width: 30,
  },
  photoErrorText: {
    color: '#9f2f1f',
    fontFamily: Fonts.mono,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 6,
  },
  noteColumn: {
    flex: 1,
  },
  noteLabel: {
    color: '#000000',
    fontFamily: Fonts.mono,
    fontSize: 14,
    marginBottom: 7,
  },
  noteInput: {
    borderColor: '#b9b9b9',
    borderRadius: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
    color: '#555555',
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 17,
    minHeight: 111,
    padding: 10,
  },
  webInputNoOutline,
  sliderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginTop: 35,
  },
  modalActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 31,
  },
  checkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  deleteButton: {
    bottom: 1,
    padding: 8,
    position: 'absolute',
    right: -4,
  },
  pressed: {
    opacity: 0.72,
  },
});
