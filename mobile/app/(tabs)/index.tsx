import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function TabHome() {
  return (
    <View className="flex-1 p-6">
      <Text className="mb-4 text-xl font-bold">Welcome</Text>
      <Link href="/(tabs)/products" asChild>
        <Pressable className="rounded-lg bg-green-600 px-4 py-2">
          <Text className="text-white">Shop Now</Text>
        </Pressable>
      </Link>
    </View>
  );
}
