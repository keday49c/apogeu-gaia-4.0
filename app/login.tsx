import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useAlert } from '@/template';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const otpSchema = z.object({
  otp: z.string().length(6, 'O código deve ter 6 dígitos'),
});

export default function LoginScreen() {
  const { sendOTP, verifyOTPAndLogin, signInWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [formType, setFormType] = useState('login'); // 'login', 'register', 'otp'
  const [emailForOTP, setEmailForOTP] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formType === 'login' ? loginSchema : formType === 'register' ? registerSchema : otpSchema),
  });

  const handleSendOTP = async (data) => {
    setEmailForOTP(data.email);
    const { error } = await sendOTP(data.email);
    if (error) {
      showAlert('Erro', error);
      return;
    }
    setFormType('otp');
    showAlert('Sucesso', 'Código OTP enviado para seu email');
  };

  const handleVerifyOTP = async (data) => {
    const { error } = await verifyOTPAndLogin(emailForOTP, data.otp, { password: data.password });
    if (error) {
      showAlert('Erro', error);
      return;
    }
    showAlert('Sucesso', 'Conta criada com sucesso!');
  };

  const handleLogin = async (data) => {
    const { error } = await signInWithPassword(data.email, data.password);
    if (error) {
      showAlert('Erro', error);
    }
  };

  const renderForm = () => {
    switch (formType) {
      case 'otp':
        return (
          <>
            <Text style={styles.otpInfo}>
              Digite o código de 6 dígitos enviado para {emailForOTP}
            </Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Código de Verificação"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.otp?.message}
                />
              )}
              name="otp"
            />
            <Button
              title="Verificar e Criar Conta"
              onPress={handleSubmit(handleVerifyOTP)}
              loading={operationLoading}
              style={styles.button}
            />
            <Button
              title="Voltar"
              onPress={() => setFormType('register')}
              variant="outline"
              style={styles.button}
            />
          </>
        );
      case 'register':
        return (
          <>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
              name="email"
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.password?.message}
                />
              )}
              name="password"
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirmar Senha"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.confirmPassword?.message}
                />
              )}
              name="confirmPassword"
            />
            <Button
              title="Enviar Código de Verificação"
              onPress={handleSubmit(handleSendOTP)}
              loading={operationLoading}
              style={styles.button}
            />
          </>
        );
      case 'login':
      default:
        return (
          <>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
              name="email"
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.password?.message}
                />
              )}
              name="password"
            />
            <Button
              title="Entrar"
              onPress={handleSubmit(handleLogin)}
              loading={operationLoading}
              style={styles.button}
            />
          </>
        );
    }
  };

  return (
    <LinearGradient
      colors={['#0A0E27', '#1A1F3A', '#2D3250']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://cdn-ai.onspace.ai/onspace/project/image/bHqpW4xJ6Ht83xdEMBj33y/logo.png' }}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.title}>APOGEU</Text>
            <Text style={styles.subtitle}>
              Plataforma de Automação de Marketing
            </Text>
          </View>

          <View style={styles.formContainer}>
            {renderForm()}

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {formType === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              </Text>
              <Button
                title={formType === 'login' ? 'Cadastrar' : 'Entrar'}
                onPress={() => setFormType(formType === 'login' ? 'register' : 'login')}
                variant="outline"
                size="small"
                style={styles.toggleButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
  otpInfo: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  toggleContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  toggleButton: {
    minWidth: 120,
  },
});
