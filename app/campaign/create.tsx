import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCampaignContext } from '@/contexts/CampaignContext'; // Updated import
import { useAlert } from '@/template';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/constants/theme';
import { CreateCampaignData } from '@/services/campaignService';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'O nome da campanha é obrigatório'),
  platform: z.string().min(1, 'A plataforma é obrigatória'),
  budget: z.preprocess(
    (val) => Number(val),
    z.number().positive('O orçamento deve ser um número positivo')
  ),
  daily_budget: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('O orçamento diário deve ser um número positivo').optional()
  ),
  objective: z.string().optional(),
});

type CreateCampaignFormInputs = z.infer<typeof createCampaignSchema>;

export default function CreateCampaignScreen() {
  const router = useRouter();
  const { createCampaign, loading: campaignLoading } = useCampaignContext();
  const { showAlert } = useAlert();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateCampaignFormInputs>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: '',
      platform: '',
      budget: 0,
      daily_budget: undefined,
      objective: '',
    },
  });

  const handleCreate = useCallback(async (data: CreateCampaignFormInputs) => {
    const campaignData: CreateCampaignData = {
      name: data.name,
      platform: data.platform,
      budget: data.budget,
      daily_budget: data.daily_budget,
      objective: data.objective || undefined,
      status: 'draft',
    };

    const { success, error } = await createCampaign(campaignData);

    if (success) {
      showAlert('Sucesso', 'Campanha criada com sucesso!');
      router.back();
    } else {
      showAlert('Erro', error || 'Falha ao criar campanha');
    }
  }, [createCampaign, showAlert, router]);

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

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome da Campanha *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ex: Promoção de Verão 2024"
                  error={errors.name?.message}
                />
              )}
              name="name"
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Plataforma *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ex: Google Ads, Meta Ads, TikTok Ads"
                  error={errors.platform?.message}
                />
              )}
              name="platform"
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Orçamento Total (R$) *"
                  value={value ? String(value) : ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="1000.00"
                  keyboardType="decimal-pad"
                  error={errors.budget?.message}
                />
              )}
              name="budget"
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Orçamento Diário (R$)"
                  value={value ? String(value) : ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="50.00"
                  keyboardType="decimal-pad"
                  helperText="Opcional - Define um limite de gasto por dia"
                  error={errors.daily_budget?.message}
                />
              )}
              name="daily_budget"
            />

            <Text style={styles.sectionTitle}>Detalhes da Campanha</Text>

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Objetivo"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ex: Aumentar conversões, gerar tráfego..."
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                  error={errors.objective?.message}
                />
              )}
              name="objective"
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Criar Campanha"
                onPress={handleSubmit(handleCreate)}
                loading={campaignLoading}
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

