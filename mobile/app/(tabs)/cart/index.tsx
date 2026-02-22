import { View, Text } from 'react-native';

export default function CartScreen() {
  return (
    <View className="flex-1 p-6">
      <Text className="text-xl font-bold">Cart</Text>
      <Text className="mt-2 text-gray-600">Your cart is empty</Text>
    </View>
  );
}
