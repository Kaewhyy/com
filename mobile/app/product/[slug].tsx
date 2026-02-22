import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../lib/api';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [product, setProduct] = useState<{ name: string; description?: string; price: number } | null>(null);

  useEffect(() => {
    if (slug) {
      api.get(`/products/${slug}`).then((res) => {
        setProduct(res.data.data || res.data);
      });
    }
  }, [slug]);

  if (!product) return <View className="flex-1 p-6"><Text>Loading...</Text></View>;

  const price = typeof product.price === 'object' && (product.price as { toNumber?: () => number }).toNumber
    ? (product.price as { toNumber: () => number }).toNumber()
    : Number(product.price);

  return (
    <ScrollView className="flex-1 p-6">
      <Text className="text-2xl font-bold">{product.name}</Text>
      <Text className="mt-2 text-xl text-green-600 font-semibold">${price.toFixed(2)}</Text>
      <Text className="mt-4 text-gray-600">{product.description || 'No description'}</Text>
      <Pressable className="mt-8 rounded-lg bg-green-600 py-3">
        <Text className="text-center text-white font-medium">Add to Cart</Text>
      </Pressable>
    </ScrollView>
  );
}
