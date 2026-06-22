import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="products" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
