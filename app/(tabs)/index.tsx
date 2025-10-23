import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCampaigns } from '@/hooks/useCampaigns';
import { analyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { StatCard } from '@/components/ui/StatCard';
import { GradientCard } from '@/components/ui/GradientCard';
import { colors, typography, spacing, gradients } from '@/constants/theme';
import { useAuth } from '@/template';

export default function DashboardScreen() {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = async () => {
    const { data } = await analyticsService.getSummary();
    if (data) {
      setSummary(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0);

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.blue} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bem-vindo de volta!</Text>
            <Text style={styles.username}>{user?.email?.split('@')[0] || 'Usuário'}</Text>
          </View>
          <Image
            source={{ uri: 'https://cdn-ai.onspace.ai/onspace/project/image/bHqpW4xJ6Ht83xdEMBj33y/logo.png' }}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <View style={styles.statHalf}>
              <StatCard
                title="Campanhas Ativas"
                value={activeCampaigns}
                gradientColors={gradients.primary}
              />
            </View>
            <View style={styles.statHalf}>
              <StatCard
                title="Orçamento Total"
                value={`R$ ${totalBudget.toFixed(0)}`}
                gradientColors={gradients.purple}
              />
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statHalf}>
              <StatCard
                title="Taxa de Conversão"
                value={`${summary?.avgCTR.toFixed(2) || 0}%`}
                change="+8.2%"
                gradientColors={gradients.blue}
              />
            </View>
            <View style={styles.statHalf}>
              <StatCard
                title="ROAS"
                value={summary?.avgROAS.toFixed(1) || '0.0'}
                change="+12.5%"
                gradientColors={gradients.secondary}
              />
            </View>
          </View>
        </View>

        <GradientCard style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Visão Geral de Performance</Text>
          
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Ionicons name="eye-outline" size={24} color={colors.primary.blue} />
              <Text style={styles.metricValue}>
                {(summary?.totalImpressions || 0).toLocaleString('pt-BR')}
              </Text>
              <Text style={styles.metricLabel}>Impressões</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metric}>
              <Ionicons name="hand-left-outline" size={24} color={colors.primary.purple} />
              <Text style={styles.metricValue}>
                {(summary?.totalClicks || 0).toLocaleString('pt-BR')}
              </Text>
              <Text style={styles.metricLabel}>Cliques</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metric}>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary.green} />
              <Text style={styles.metricValue}>
                {(summary?.totalConversions || 0).toLocaleString('pt-BR')}
              </Text>
              <Text style={styles.metricLabel}>Conversões</Text>
            </View>
          </View>
        </GradientCard>

        <GradientCard style={styles.quickActionsCard}>
          <Text style={styles.cardTitle}>Ações Rápidas</Text>
          <Text style={styles.quickActionsText}>
            Crie sua primeira campanha na aba "Campanhas" para começar a automatizar seu marketing digital.
          </Text>
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="rocket" size={20} color={colors.primary.blue} />
              <Text style={styles.featureText}>Automação Inteligente</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="analytics" size={20} color={colors.primary.purple} />
              <Text style={styles.featureText}>Análises em Tempo Real</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="trending-up" size={20} color={colors.primary.green} />
              <Text style={styles.featureText}>Otimização de ROI</Text>
            </View>
          </View>
        </GradientCard>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  username: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  logo: {
    width: 50,
    height: 50,
  },
  statsGrid: {
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statHalf: {
    flex: 1,
  },
  overviewCard: {
    margin: spacing.lg,
    marginTop: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  quickActionsCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  quickActionsText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.text.primary,
  },
});
