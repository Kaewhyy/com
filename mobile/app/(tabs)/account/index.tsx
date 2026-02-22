import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function AccountScreen() {
  return (
    <View className="flex-1 p-6">
      <Text className="text-xl font-bold">Account</Text>
      <Link href="/login" asChild className="mt-4">
        <Pressable className="rounded-lg bg-green-600 px-4 py-2">
          <Text className="text-white">Sign In</Text>
        </Pressable>
      </Link>
    </View>
  );
}
