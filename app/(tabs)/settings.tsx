import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GradientCard } from '@/components/ui/GradientCard';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface SettingOption {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();

  const handleLogout = useCallback(() => {
    showAlert('Confirmar', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          const { error } = await logout();
          if (error) {
            showAlert('Erro', error);
          }
        },
      },
    ]);
  }, [logout, showAlert]);

  const settingsOptions: SettingOption[] = [
    {
      icon: 'person-outline',
      title: 'Perfil',
      subtitle: 'Gerencie suas informações pessoais',
      onPress: useCallback(() => showAlert('Em breve', 'Funcionalidade em desenvolvimento'), [showAlert]),
    },
    {
      icon: 'notifications-outline',
      title: 'Notificações',
      subtitle: 'Configure alertas e notificações',
      onPress: useCallback(() => showAlert('Em breve', 'Funcionalidade em desenvolvimento'), [showAlert]),
    },
    {
      icon: 'card-outline',
      title: 'Pagamentos',
      subtitle: 'Gerencie métodos de pagamento',
      onPress: useCallback(() => showAlert('Em breve', 'Funcionalidade em desenvolvimento'), [showAlert]),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Segurança',
      subtitle: 'Configurações de segurança e privacidade',
      onPress: useCallback(() => showAlert('Em breve', 'Funcionalidade em desenvolvimento'), [showAlert]),
    },
    {
      icon: 'help-circle-outline',
      title: 'Ajuda e Suporte',
      subtitle: 'Central de ajuda e documentação',
      onPress: useCallback(() => showAlert('Em breve', 'Funcionalidade em desenvolvimento'), [showAlert]),
    },
    {
      icon: 'information-circle-outline',
      title: 'Sobre',
      subtitle: 'Versão 1.0.0 - Plataforma Apogeu',
      onPress: useCallback(() => showAlert('Apogeu', 'Plataforma de Automação de Marketing\nVersão 1.0.0'), [showAlert]),
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
        </View>

        <GradientCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color={colors.text.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.email?.split('@')[0] || 'Usuário'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </GradientCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geral</Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <View style={styles.settingIcon}>
                <Ionicons name={option.icon} size={24} color={colors.primary.blue} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dangerZone}>
          <Button
            title="Sair da Conta"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
        </View>

        <Text style={styles.footer}>
          © 2024 Apogeu. Todos os direitos reservados.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  profileCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  profileEmail: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  section: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  dangerZone: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  logoutButton: {
    marginBottom: spacing.md,
  },
  footer: {
    ...typography.small,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

