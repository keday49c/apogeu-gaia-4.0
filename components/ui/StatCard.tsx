import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, spacing } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  gradientColors: string[];
}

export function StatCard({ title, value, change, gradientColors }: StatCardProps) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {change && (
        <Text style={styles.change}>{change}</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.caption,
    color: colors.text.primary, // Changed to primary for better contrast on gradients
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  change: {
    ...typography.caption,
    color: colors.success, // Assuming success color has good contrast on various gradients
    marginTop: spacing.xs,
  },
});

