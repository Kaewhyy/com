import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="mb-6 text-2xl font-bold">E-commerce App</Text>
      <Link href="/(tabs)/products" asChild>
        <Pressable className="rounded-lg bg-green-600 px-6 py-3">
          <Text className="text-white font-medium">Browse Products</Text>
        </Pressable>
      </Link>
      <Link href="/login" asChild className="mt-4">
        <Pressable className="rounded-lg border border-gray-300 px-6 py-3">
          <Text className="text-gray-700">Sign In</Text>
        </Pressable>
      </Link>
    </View>
  );
}
