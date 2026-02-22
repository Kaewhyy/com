import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { api } from '../../lib/api';

export default function ProductsScreen() {
  const [products, setProducts] = useState<{ id: string; name: string; slug: string; price: number }[]>([]);

  useEffect(() => {
    api.get('/products').then((res) => {
      const data = res.data.data || res.data;
      setProducts(data.data || data || []);
    });
  }, []);

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        renderItem={({ item }) => (
          <Link href={`/product/${item.slug}`} asChild>
            <Pressable className="flex-1 rounded-lg border bg-white p-4">
              <View className="aspect-square rounded bg-gray-100" />
              <Text className="mt-2 font-medium" numberOfLines={2}>{item.name}</Text>
              <Text className="mt-1 text-green-600 font-semibold">
                ${typeof item.price === 'object' ? Number((item.price as { toNumber?: () => number }).toNumber?.() ?? item.price) : Number(item.price).toFixed(2)}
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
