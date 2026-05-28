import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export function PlantPhoto({
  imageUrl,
  style,
}: {
  imageUrl?: string | null;
  style: StyleProp<ViewStyle>;
}) {
  if (!imageUrl) {
    return (
      <View style={[style, styles.emptyImageBox]}>
        <Feather color="#b8b8b8" name="image" size={20} />
      </View>
    );
  }

  return (
    <View style={[style, styles.imageFrame]}>
      <Image contentFit="cover" source={{ uri: imageUrl }} style={styles.plantImage} transition={120} />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyImageBox: {
    alignItems: 'center',
    borderColor: '#d0d0d0',
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
  },
  imageFrame: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d0d0d0',
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  plantImage: {
    height: '100%',
    width: '100%',
  },
});
