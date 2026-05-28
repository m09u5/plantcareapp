import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

export function ScanScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Scan :</Text>
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
});
