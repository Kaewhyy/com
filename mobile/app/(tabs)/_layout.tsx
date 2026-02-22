import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="products/index" options={{ title: 'Products', tabBarLabel: 'Shop' }} />
      <Tabs.Screen name="cart/index" options={{ title: 'Cart', tabBarLabel: 'Cart' }} />
      <Tabs.Screen name="account/index" options={{ title: 'Account', tabBarLabel: 'Account' }} />
    </Tabs>
  );
}
