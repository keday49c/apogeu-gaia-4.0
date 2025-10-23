import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { campaignService, Campaign } from '@/services/campaignService';
import { analyticsService, CampaignAnalytics } from '@/services/analyticsService';
import { useAlert } from '@/template';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GradientCard } from '@/components/ui/GradientCard';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaignData();
  }, [id]);

  const loadCampaignData = async () => {
    if (typeof id !== 'string') return;

    const { data: campaignData } = await campaignService.getById(id);
    if (campaignData) {
      setCampaign(campaignData);
    }

    const { data: analyticsData } = await analyticsService.getByCampaign(id);
    if (analyticsData && analyticsData.length === 0) {
      await analyticsService.createMockData(id);
      const { data: newAnalyticsData } = await analyticsService.getByCampaign(id);
      setAnalytics(newAnalyticsData || []);
    } else {
      setAnalytics(analyticsData || []);
    }

    setLoading(false);
  };

  const handleGenerateData = async () => {
    if (typeof id !== 'string') return;

    showAlert('Gerar Dados', 'Deseja gerar dados de análise simulados para esta campanha?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Gerar',
        onPress: async () => {
          const { error } = await analyticsService.createMockData(id);
          if (error) {
            showAlert('Erro', error);
          } else {
            showAlert('Sucesso', 'Dados de análise gerados com sucesso!');
            loadCampaignData();
          }
        },
      },
    ]);
  };

  if (loading || !campaign) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const totalImpressions = analytics.reduce((sum, a) => sum + Number(a.impressions), 0);
  const totalClicks = analytics.reduce((sum, a) => sum + Number(a.clicks), 0);
  const totalConversions = analytics.reduce((sum, a) => sum + Number(a.conversions), 0);
  const totalCost = analytics.reduce((sum, a) => sum + Number(a.cost), 0);
  const avgCTR = analytics.length > 0
    ? analytics.reduce((sum, a) => sum + Number(a.ctr), 0) / analytics.length
    : 0;

  const statusColors: Record<Campaign['status'], string> = {
    active: colors.status.active,
    paused: colors.status.paused,
    draft: colors.status.draft,
    completed: colors.status.completed,
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <GradientCard style={styles.headerCard}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusColors[campaign.status] },
                ]}
              />
              <Text style={[styles.statusText, { color: statusColors[campaign.status] }]}>
                {campaign.status.toUpperCase()}
              </Text>
            </View>
          </GradientCard>

          <GradientCard style={styles.infoCard}>
            <Text style={styles.cardTitle}>Informações da Campanha</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="logo-google" size={20} color={colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Plataforma</Text>
                <Text style={styles.infoValue}>{campaign.platform}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Orçamento Total</Text>
                <Text style={styles.infoValue}>R$ {Number(campaign.budget).toFixed(2)}</Text>
              </View>
            </View>

            {campaign.daily_budget && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Orçamento Diário</Text>
                  <Text style={styles.infoValue}>R$ {Number(campaign.daily_budget).toFixed(2)}</Text>
                </View>
              </View>
            )}

            {campaign.objective && (
              <View style={styles.infoRow}>
                <Ionicons name="flag-outline" size={20} color={colors.text.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Objetivo</Text>
                  <Text style={styles.infoValue}>{campaign.objective}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Criada em</Text>
                <Text style={styles.infoValue}>
                  {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
          </GradientCard>

          {analytics.length > 0 ? (
            <GradientCard style={styles.analyticsCard}>
              <Text style={styles.cardTitle}>Performance</Text>
              
              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{totalImpressions.toLocaleString('pt-BR')}</Text>
                  <Text style={styles.metricLabel}>Impressões</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{totalClicks.toLocaleString('pt-BR')}</Text>
                  <Text style={styles.metricLabel}>Cliques</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{totalConversions.toLocaleString('pt-BR')}</Text>
                  <Text style={styles.metricLabel}>Conversões</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>R$ {totalCost.toFixed(2)}</Text>
                  <Text style={styles.metricLabel}>Custo</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{avgCTR.toFixed(2)}%</Text>
                  <Text style={styles.metricLabel}>CTR Médio</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>
                    R$ {totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : '0.00'}
                  </Text>
                  <Text style={styles.metricLabel}>CPC</Text>
                </View>
              </View>
            </GradientCard>
          ) : (
            <GradientCard style={styles.emptyAnalyticsCard}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>Nenhum dado de análise</Text>
              <Text style={styles.emptyText}>
                Gere dados simulados para visualizar a performance desta campanha
              </Text>
              <Button
                title="Gerar Dados de Análise"
                onPress={handleGenerateData}
                gradientColors={['#2196F3', '#9C27B0']}
                style={styles.generateButton}
              />
            </GradientCard>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  campaignName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  analyticsCard: {
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricBox: {
    width: '48%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  emptyAnalyticsCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  generateButton: {
    minWidth: 200,
  },
});
