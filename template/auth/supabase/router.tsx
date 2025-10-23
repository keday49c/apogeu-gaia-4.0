import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from './hook';
import { colors, typography, spacing } from '@/constants/theme';

const DefaultLoadingScreen = () => (
  <View style={styles.defaultContainer}>
    <ActivityIndicator size="large" color={colors.primary.blue} />
    <Text style={styles.defaultText}>Carregando...</Text>
  </View>
);

interface AuthRouterProps {
  children: React.ReactNode;
  loginRoute?: string;
  loadingComponent?: React.ComponentType;
  excludeRoutes?: string[];
}

export function AuthRouter({
  children,
  loginRoute = '/login',
  loadingComponent: LoadingComponent = DefaultLoadingScreen,
  excludeRoutes = []
}: AuthRouterProps) {
  const { user, loading, initialized } = useAuth();
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
  },
  defaultText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

