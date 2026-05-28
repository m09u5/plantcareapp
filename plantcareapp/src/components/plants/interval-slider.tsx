import React from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { Fonts } from '@/constants/theme';

const sliderWidth = 255;

export function IntervalSlider({
  interval,
  onChange,
}: {
  interval: number;
  onChange: (value: number) => void;
}) {
  const percent = (interval - 1) / 29;

  function updateFromTouch(event: GestureResponderEvent) {
    const x = Math.max(0, Math.min(sliderWidth, event.nativeEvent.locationX));
    const nextValue = Math.round(1 + (x / sliderWidth) * 29);

    onChange(Math.min(30, Math.max(1, nextValue)));
  }

  return (
    <View
      onResponderGrant={updateFromTouch}
      onResponderMove={updateFromTouch}
      onStartShouldSetResponder={() => true}
      style={styles.slider}>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${Math.round(percent * 100)}%` }]} />
      </View>
      <View
        style={[
          styles.sliderBadge,
          { left: Math.max(0, Math.min(sliderWidth - 56, percent * sliderWidth - 28)) },
        ]}>
        <Text style={styles.sliderBadgeText}>{interval} days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    height: 32,
    justifyContent: 'center',
    width: sliderWidth,
  },
  sliderTrack: {
    backgroundColor: '#ededed',
    borderRadius: 12,
    height: 16,
    overflow: 'hidden',
  },
  sliderFill: {
    backgroundColor: '#bcefff',
    height: '100%',
  },
  sliderBadge: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 9,
    elevation: 3,
    height: 19,
    justifyContent: 'center',
    minWidth: 56,
    position: 'absolute',
    shadowColor: '#8b8b8b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    top: 7,
  },
  sliderBadgeText: {
    color: '#777777',
    fontFamily: Fonts.mono,
    fontSize: 11,
  },
});
