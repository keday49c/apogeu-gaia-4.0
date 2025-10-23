import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '@/constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  gradientColors?: string[];
  style?: ViewStyle;
}

export function GradientCard({ children, gradientColors, style }: GradientCardProps) {
  if (gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={[styles.card, styles.solidCard, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  solidCard: {
    backgroundColor: colors.background.card,
  },
});
