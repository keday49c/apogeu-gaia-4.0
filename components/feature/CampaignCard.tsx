import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Campaign } from '@/services/campaignService';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { GradientCard } from '@/components/ui/GradientCard';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: () => void;
  onDelete: () => void;
  onStatusChange: (status: Campaign['status']) => void;
}

const statusColors: Record<Campaign['status'], string> = {
  active: colors.status.active,
  paused: colors.status.paused,
  draft: colors.status.draft,
  completed: colors.status.completed,
};

const statusIcons: Record<Campaign['status'], React.ComponentProps<typeof Ionicons>['name']> = {
  active: 'play-circle',
  paused: 'pause-circle',
  draft: 'create',
  completed: 'checkmark-circle',
};

const getNextStatus = (current: Campaign['status']): Campaign['status'] => {
  if (current === 'draft') return 'active';
  if (current === 'active') return 'paused';
  if (current === 'paused') return 'active';
  return 'active'; // Default or handle 'completed' status appropriately
};

export function CampaignCard({ campaign, onPress, onDelete, onStatusChange }: CampaignCardProps) {
  const handleStatusToggle = useCallback(() => {
    onStatusChange(getNextStatus(campaign.status));
  }, [campaign.status, onStatusChange]);

  const handleDeletePress = useCallback(() => {
    onDelete();
  }, [onDelete]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GradientCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {campaign.name}
            </Text>
            <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            </TouchableOpacity>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[campaign.status] + '20' }]}>
              <Ionicons
                name={statusIcons[campaign.status]}
                size={14}
                color={statusColors[campaign.status]}
              />
              <Text style={[styles.statusText, { color: statusColors[campaign.status] }]}>
                {campaign.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="logo-google" size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>{campaign.platform}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>R$ {campaign.budget.toFixed(2)}</Text>
          </View>
        </View>

        {campaign.objective && (
          <Text style={styles.objective} numberOfLines={2}>
            {campaign.objective}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.date}>
            Criada em {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
          </Text>
          {campaign.status !== 'completed' && (
            <TouchableOpacity
              onPress={handleStatusToggle}
              style={styles.actionButton}
            >
              <Ionicons
                name={campaign.status === 'active' ? 'pause' : 'play'}
                size={18}
                color={colors.primary.blue}
              />
              <Text style={styles.actionText}>
                {campaign.status === 'active' ? 'Pausar' : campaign.status === 'paused' ? 'Retomar' : 'Iniciar'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GradientCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  objective: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  date: {
    ...typography.small,
    color: colors.text.tertiary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.primary.blue,
    fontWeight: '600',
  },
});

