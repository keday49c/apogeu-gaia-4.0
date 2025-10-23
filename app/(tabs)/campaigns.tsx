import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAlert } from '@/template';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { CampaignCard } from '@/components/feature/CampaignCard';
import { Campaign } from '@/services/campaignService';
import { colors, typography, spacing } from '@/constants/theme';

export default function CampaignsScreen() {
  const router = useRouter();
  const { campaigns, loading, refreshCampaigns, deleteCampaign, updateCampaignStatus } = useCampaigns();
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCampaigns();
    setRefreshing(false);
  };

  const handleDelete = (campaign: Campaign) => {
    showAlert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a campanha "${campaign.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const { success, error } = await deleteCampaign(campaign.id);
            if (success) {
              showAlert('Sucesso', 'Campanha excluída com sucesso');
            } else {
              showAlert('Erro', error || 'Falha ao excluir campanha');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (campaign: Campaign, newStatus: Campaign['status']) => {
    const { success, error } = await updateCampaignStatus(campaign.id, newStatus);
    if (success) {
      showAlert('Sucesso', `Campanha ${newStatus === 'active' ? 'ativada' : 'pausada'} com sucesso`);
    } else {
      showAlert('Erro', error || 'Falha ao atualizar status');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Campanhas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/campaign/create')}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary.blue} />
        </TouchableOpacity>
      </View>

      {campaigns.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="megaphone-outline" size={80} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Nenhuma campanha ainda</Text>
          <Text style={styles.emptyText}>
            Crie sua primeira campanha para começar a automatizar seu marketing
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/campaign/create')}
          >
            <Ionicons name="add" size={20} color={colors.text.primary} />
            <Text style={styles.emptyButtonText}>Criar Campanha</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={campaigns}
          renderItem={({ item }) => (
            <CampaignCard
              campaign={item}
              onPress={() => router.push(`/campaign/${item.id}`)}
              onDelete={() => handleDelete(item)}
              onStatusChange={(status) => handleStatusChange(item, status)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.blue}
            />
          }
        />
      )}
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
  addButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.blue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  emptyButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
