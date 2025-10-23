import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider, AlertProvider } from '@/template';
import { CampaignProvider } from '@/contexts/CampaignContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <AuthProvider>
        <CampaignProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="campaign/[id]"
              options={{
                headerShown: true,
                headerTitle: 'Detalhes',
                headerStyle: {
                  backgroundColor: '#1A1F3A',
                },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Voltar',
              }}
            />
            <Stack.Screen
              name="campaign/create"
              options={{
                headerShown: true,
                headerTitle: 'Nova Campanha',
                headerStyle: {
                  backgroundColor: '#1A1F3A',
                },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Voltar',
              }}
            />
          </Stack>
        </CampaignProvider>
      </AuthProvider>
    </AlertProvider>
  );
}
