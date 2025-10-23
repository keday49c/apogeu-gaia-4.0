import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: string[];
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  gradientColors,
}: ButtonProps) {
  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  if (variant === 'primary' && !disabled) {
    const colors = gradientColors || ['#2196F3', '#9C27B0'];
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, sizeStyles[size], style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={[styles.text, textSizeStyles[size], textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    primary: styles.primary,
    secondary: styles.secondary,
    outline: styles.outline,
    danger: styles.danger,
  };

  const textVariantStyles = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    outline: styles.textOutline,
    danger: styles.textDanger,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary.blue : colors.text.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            textSizeStyles[size],
            textVariantStyles[variant],
            disabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary.blue,
  },
  secondary: {
    backgroundColor: colors.background.tertiary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.blue,
  },
  danger: {
    backgroundColor: colors.status.error,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textPrimary: {
    color: colors.text.primary,
  },
  textSecondary: {
    color: colors.text.primary,
  },
  textOutline: {
    color: colors.primary.blue,
  },
  textDanger: {
    color: colors.text.primary,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
});
