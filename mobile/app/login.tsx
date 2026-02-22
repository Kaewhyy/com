import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { api } from './lib/api';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.accessToken || data.data?.accessToken;
      const user = data.user || data.data?.user;
      if (token) {
        await SecureStore.setItemAsync('accessToken', token);
        if (data.refreshToken) await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="mb-6 text-2xl font-bold">Sign In</Text>
      {error ? <Text className="mb-4 text-red-600">{error}</Text> : null}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="mb-4 rounded-lg border border-gray-300 p-3"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="mb-6 rounded-lg border border-gray-300 p-3"
      />
      <Pressable onPress={handleLogin} className="rounded-lg bg-green-600 py-3">
        <Text className="text-center text-white font-medium">Sign In</Text>
      </Pressable>
      <Link href="/register" asChild className="mt-4">
        <Pressable>
          <Text className="text-center text-gray-600">Don&apos;t have an account? Register</Text>
        </Pressable>
      </Link>
    </View>
  );
}
