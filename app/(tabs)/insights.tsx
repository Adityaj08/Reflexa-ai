import React from 'react';
import { View, StyleSheet } from 'react-native';
import InsightsView from '@/components/InsightsView';
import colors from '@/constants/colors';

export default function InsightsScreen() {
  return (
    <View style={styles.container}>
      <InsightsView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});