import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, gradients } from '@/constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  gradientColors?: string[];
  style?: ViewStyle;
}

export function GradientCard({ children, gradientColors, style }: GradientCardProps) {
  const currentGradientColors = gradientColors || gradients.default; // Use a default gradient if none provided

  return (
    <LinearGradient
      colors={currentGradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
});

