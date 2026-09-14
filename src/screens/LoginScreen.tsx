import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Required', 'Please enter username and password.');
      return;
    }

    try {
      setLoading(true);
      await signIn(username.trim(), password);
    } catch (error: any) {
      Alert.alert('Login failed', error?.response?.data?.message ?? error?.message ?? 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0E3B2A', '#176B4D', '#2FA574']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.card}>
            <Text style={styles.eyebrow}>FIELD OPERATIONS</Text>
            <Text style={styles.title}>Meter & Fuel</Text>
            <Text style={styles.subtitle}>Sign in with your operator account.</Text>

            <View style={styles.form}>
              <FormField
                label="Username"
                placeholder="Enter username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
              <FormField
                label="Password"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                rightAccessory={
                  <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7278" />
                  </Pressable>
                }
              />
              <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 22 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, gap: 6 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: '#176B4D' },
  title: { fontSize: 32, fontWeight: '800', color: '#111715', marginTop: 3 },
  subtitle: { fontSize: 15, color: '#6B7278', marginTop: 2 },
  form: { marginTop: 24, gap: 16 },
});
