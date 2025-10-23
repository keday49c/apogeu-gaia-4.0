import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, spacing, gradients } from '@/constants/theme';

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
  gradientColors: customGradientColors,
}: ButtonProps) {
  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [onPress, disabled, loading]);

  const isPrimary = variant === 'primary';
  const currentGradientColors = customGradientColors || gradients.primary;

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

  const variantStyles = StyleSheet.create({
    primary: {
      backgroundColor: isPrimary && !customGradientColors ? colors.primary.blue : undefined,
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
  });

  const textVariantStyles = StyleSheet.create({
    primary: {
      color: colors.text.primary,
    },
    secondary: {
      color: colors.text.primary,
    },
    outline: {
      color: colors.primary.blue,
    },
    danger: {
      color: colors.text.primary,
    },
  });

  const content = loading ? (
    <ActivityIndicator color={isPrimary && !customGradientColors ? colors.text.primary : (variant === 'outline' ? colors.primary.blue : colors.text.primary)} />
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
  );

  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.container, sizeStyles[size], style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={currentGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
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
      {content}
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
    flex: 1, // Ensure gradient fills the touchable area
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
  textDisabled: {
    color: colors.text.disabled,
  },
});

