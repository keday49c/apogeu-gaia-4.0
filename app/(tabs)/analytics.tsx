import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { StatCard } from '@/components/ui/StatCard';
import { GradientCard } from '@/components/ui/GradientCard';
import { colors, typography, spacing, gradients } from '@/constants/theme';

export default function AnalyticsScreen() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    const { data } = await analyticsService.getSummary();
    if (data) {
      setSummary(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.blue} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Análises</Text>
          <Ionicons name="analytics" size={28} color={colors.primary.blue} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total de Impressões"
            value={(summary?.totalImpressions || 0).toLocaleString('pt-BR')}
            gradientColors={gradients.primary}
          />
          
          <StatCard
            title="Total de Cliques"
            value={(summary?.totalClicks || 0).toLocaleString('pt-BR')}
            gradientColors={gradients.purple}
          />
          
          <StatCard
            title="Conversões"
            value={(summary?.totalConversions || 0).toLocaleString('pt-BR')}
            gradientColors={gradients.success}
          />
          
          <StatCard
            title="Custo Total"
            value={`R$ ${(summary?.totalCost || 0).toFixed(2)}`}
            gradientColors={gradients.danger}
          />
        </View>

        <GradientCard style={styles.metricsCard}>
          <Text style={styles.cardTitle}>Métricas de Performance</Text>
          
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Ionicons name="analytics-outline" size={20} color={colors.primary.blue} />
              <Text style={styles.metricName}>Taxa de Cliques (CTR)</Text>
            </View>
            <Text style={styles.metricValue}>{(summary?.avgCTR || 0).toFixed(2)}%</Text>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Ionicons name="trending-up-outline" size={20} color={colors.primary.green} />
              <Text style={styles.metricName}>Retorno sobre Investimento (ROAS)</Text>
            </View>
            <Text style={styles.metricValue}>{(summary?.avgROAS || 0).toFixed(2)}x</Text>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Ionicons name="cash-outline" size={20} color={colors.primary.purple} />
              <Text style={styles.metricName}>Custo por Clique (CPC)</Text>
            </View>
            <Text style={styles.metricValue}>
              R$ {summary?.totalClicks ? (summary.totalCost / summary.totalClicks).toFixed(2) : '0.00'}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Ionicons name="repeat-outline" size={20} color={colors.primary.magenta} />
              <Text style={styles.metricName}>Taxa de Conversão</Text>
            </View>
            <Text style={styles.metricValue}>
              {summary?.totalClicks ? ((summary.totalConversions / summary.totalClicks) * 100).toFixed(2) : '0.00'}%
            </Text>
          </View>
        </GradientCard>

        <GradientCard style={styles.insightsCard}>
          <Text style={styles.cardTitle}>Insights e Recomendações</Text>
          
          <View style={styles.insightItem}>
            <Ionicons name="bulb" size={24} color={colors.primary.cyan} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Otimize suas campanhas</Text>
              <Text style={styles.insightText}>
                Campanhas com CTR acima de 3% tendem a ter melhor performance
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="star" size={24} color={colors.primary.cyan} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Melhore o ROAS</Text>
              <Text style={styles.insightText}>
                Foque em públicos que convertem melhor para aumentar o retorno
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="rocket" size={24} color={colors.primary.cyan} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Escale suas campanhas</Text>
              <Text style={styles.insightText}>
                Aumente o orçamento gradualmente em campanhas de alta performance
              </Text>
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
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  statsGrid: {
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
  },
  metricsCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  metricName: {
    ...typography.body,
    color: colors.text.secondary,
  },
  metricValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  insightsCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  insightItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  insightText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
