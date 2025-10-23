import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider, AlertProvider } from '@/template';
import { CampaignProvider } from '@/contexts/CampaignContext';
import { colors } from '@/constants/theme'; // Import colors for header styling

export default function RootLayout() {
  return (
    <AlertProvider>
      <AuthProvider>
        <CampaignProvider>
          <Stack
            screenOptions={{
              headerShown: false, // Default to no header, individual screens can override
              contentStyle: { backgroundColor: colors.background.primary }, // Consistent background
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="campaign/[id]"
              options={{
                headerShown: true,
                headerTitle: 'Detalhes da Campanha',
                headerStyle: {
                  backgroundColor: colors.background.secondary, // Use theme colors
                },
                headerTintColor: colors.text.primary, // Use theme colors
                headerBackTitle: 'Voltar',
              }}
            />
            <Stack.Screen
              name="campaign/create"
              options={{
                headerShown: true,
                headerTitle: 'Nova Campanha',
                headerStyle: {
                  backgroundColor: colors.background.secondary, // Use theme colors
                },
                headerTintColor: colors.text.primary, // Use theme colors
                headerBackTitle: 'Voltar',
              }}
            />
          </Stack>
        </CampaignProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

