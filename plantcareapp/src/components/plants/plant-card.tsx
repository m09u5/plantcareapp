import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import type { Plant } from '@/lib/api';
import { PlantPhoto } from './plant-photo';
import { daysAgoLabel, getWaterLevel } from './plant-utils';

const accentColor = '#00d47a';
const waterBlue = '#00bfff';

export function PlantCard({
  onLongPress,
  onPress,
  plant,
}: {
  onLongPress: () => void;
  onPress: () => void;
  plant: Plant;
}) {
  const isThirsty = plant.status === 'needs_watering';
  const statusLabel = isThirsty ? 'Thirsty' : daysAgoLabel(plant.lastWatered);
  const progress = getWaterLevel(plant);

  return (
    <View style={styles.cardWrap}>
      <Text numberOfLines={1} style={styles.cardTitle}>
        {plant.name}
      </Text>
      <Pressable
        accessibilityRole="button"
        delayLongPress={360}
        onLongPress={onLongPress}
        onPress={onPress}
        style={({ pressed }) => [styles.plantCard, pressed && styles.cardPressed]}>
        <Text style={styles.cornerDot}>•</Text>
        <PlantPhoto imageUrl={plant.imageUrl} style={styles.imagePlaceholder} />
        <View style={styles.waterColumn}>
          <Feather color={waterBlue} name="droplet" size={16} />
          <View style={styles.waterTrack}>
            <View style={[styles.waterLevel, { height: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>
        <Text style={[styles.cardStatus, isThirsty ? styles.thirstyText : styles.wateredText]}>
          {statusLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    maxWidth: 191,
    minWidth: 150,
    width: '47.8%',
  },
  cardTitle: {
    color: '#000000',
    fontFamily: Fonts.mono,
    fontSize: 13,
    marginBottom: 3,
    paddingLeft: 14,
  },
  plantCard: {
    borderColor: '#969696',
    borderRadius: 15,
    borderWidth: 1,
    height: 190,
    padding: 12,
    position: 'relative',
  },
  cardPressed: {
    backgroundColor: '#f7f7f7',
  },
  cornerDot: {
    color: '#777777',
    fontFamily: Fonts.mono,
    fontSize: 18,
    left: 10,
    lineHeight: 18,
    position: 'absolute',
    top: 2,
  },
  imagePlaceholder: {
    height: 128,
    marginLeft: 2,
    marginTop: 9,
    width: '82%',
  },
  waterColumn: {
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: 20,
  },
  waterTrack: {
    backgroundColor: '#d5f8ff',
    borderRadius: 12,
    height: 100,
    justifyContent: 'flex-end',
    marginTop: 10,
    overflow: 'hidden',
    width: 10,
  },
  waterLevel: {
    backgroundColor: '#29d9ff',
    borderRadius: 12,
    width: '100%',
  },
  cardStatus: {
    bottom: 12,
    fontFamily: Fonts.mono,
    fontSize: 13,
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  wateredText: {
    color: accentColor,
  },
  thirstyText: {
    color: '#ff0000',
    fontSize: 16,
  },
});
