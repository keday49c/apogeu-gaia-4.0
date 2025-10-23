import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useMockAuth } from './hook';
import { colors, typography, spacing } from '@/constants/theme';

const DefaultMockLoadingScreen = () => (
  <View style={styles.defaultContainer}>
    <ActivityIndicator size="large" color={colors.primary.blue} />
    <Text style={styles.defaultText}>Ambiente Mock carregando...</Text>
    <Text style={styles.hintText}>Modo de desenvolvimento - usando autenticação mock</Text>
  </View>
);

interface MockAuthRouterProps {
  children: React.ReactNode;
  loginRoute?: string;
  loadingComponent?: React.ComponentType;
  excludeRoutes?: string[];
}

export function MockAuthRouter({
  children,
  loginRoute = '/login',
  loadingComponent: LoadingComponent = DefaultMockLoadingScreen,
  excludeRoutes = []
}: MockAuthRouterProps) {
  const { user, loading, initialized } = useMockAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = useMemo(() => pathname === loginRoute, [pathname, loginRoute]);
  const isExcludedRoute = useMemo(() => 
    excludeRoutes.some(route => pathname.startsWith(route)), 
    [pathname, excludeRoutes]
  );

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    if (!user && !isLoginRoute && !isExcludedRoute) {
      router.push(loginRoute);
    } else if (user && isLoginRoute) {
      router.replace('/');
    }
  }, [user, loading, initialized, isLoginRoute, isExcludedRoute, loginRoute, router]);

  if (loading || !initialized) {
    return <LoadingComponent />;
  }

  if (isLoginRoute || isExcludedRoute || user) {
    return <>{children}</>;
  }

  // Fallback in case of unhandled state, though useEffect should handle most cases
  return <LoadingComponent />;
}

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  defaultText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  hintText: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

