import { Stack } from 'expo-router';

export default function ExploreTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="services" />
      <Stack.Screen name="products" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="product/[id]" />
    </Stack>
  );
}
