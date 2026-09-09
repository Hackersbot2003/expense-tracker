import { Link } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    setError('');
    if (Object.values(form).some((v) => !v)) {
      setError('Please fill in every field');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, username: form.username.toLowerCase() });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start tracking your money in minutes.</Text>

        <View style={styles.form}>
          <AppInput label="Name" value={form.name} onChangeText={update('name')} placeholder="Vinay Patidar" />
          <AppInput
            label="Username"
            value={form.username}
            onChangeText={update('username')}
            autoCapitalize="none"
            placeholder="vinay123"
          />
          <AppInput
            label="Email"
            value={form.email}
            onChangeText={update('email')}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <AppInput label="Password" value={form.password} onChangeText={update('password')} secureTextEntry placeholder="••••••••" />
          <AppInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={update('confirmPassword')}
            secureTextEntry
            placeholder="••••••••"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppButton title="Create Account" onPress={handleRegister} loading={loading} />

          <Link href="/(auth)/login" asChild>
            <AppButton title="Back to Login" onPress={() => {}} variant="secondary" style={styles.secondaryButton} />
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.md },
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: 'center' },
  secondaryButton: { marginTop: spacing.sm },
});
