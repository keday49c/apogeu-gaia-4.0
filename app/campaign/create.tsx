import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useCampaigns } from '@/hooks/useCampaigns';
import { analyticsService } from '@/services/analyticsService';
import { useAlert } from '@/template';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/constants/theme';

export default function CreateCampaignScreen() {
  const router = useRouter();
  const { createCampaign } = useCampaigns();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [budget, setBudget] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !platform || !budget) {
      showAlert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showAlert('Erro', 'Orçamento inválido');
      return;
    }

    setLoading(true);

    const campaignData = {
      name,
      platform,
      budget: budgetNum,
      daily_budget: dailyBudget ? parseFloat(dailyBudget) : undefined,
      objective: objective || undefined,
      status: 'draft' as const,
    };

    const { success, error } = await createCampaign(campaignData);

    if (success) {
      showAlert('Sucesso', 'Campanha criada com sucesso!');
      router.back();
    } else {
      showAlert('Erro', error || 'Falha ao criar campanha');
    }

    setLoading(false);
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>

            <Input
              label="Nome da Campanha *"
              value={name}
              onChangeText={setName}
              placeholder="Ex: Promoção de Verão 2024"
            />

            <Input
              label="Plataforma *"
              value={platform}
              onChangeText={setPlatform}
              placeholder="Ex: Google Ads, Meta Ads, TikTok Ads"
            />

            <Input
              label="Orçamento Total (R$) *"
              value={budget}
              onChangeText={setBudget}
              placeholder="1000.00"
              keyboardType="decimal-pad"
            />

            <Input
              label="Orçamento Diário (R$)"
              value={dailyBudget}
              onChangeText={setDailyBudget}
              placeholder="50.00"
              keyboardType="decimal-pad"
              helperText="Opcional - Define um limite de gasto por dia"
            />

            <Text style={styles.sectionTitle}>Detalhes da Campanha</Text>

            <Input
              label="Objetivo"
              value={objective}
              onChangeText={setObjective}
              placeholder="Ex: Aumentar conversões, gerar tráfego..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Criar Campanha"
                onPress={handleCreate}
                loading={loading}
                gradientColors={['#2196F3', '#9C27B0']}
              />
              <Button
                title="Cancelar"
                onPress={() => router.back()}
                variant="outline"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});
