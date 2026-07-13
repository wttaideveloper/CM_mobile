import { Stack } from 'expo-router';

import { useAppPresence } from '@/hooks/useAppPresence';

function AppPresenceSync() {
  useAppPresence(true);
  return null;
}

export default function MainLayout() {
  return (
    <>
      <AppPresenceSync />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="enterprises" />
      <Stack.Screen name="services" />
      <Stack.Screen name="products" />
      <Stack.Screen name="events" />
      <Stack.Screen name="courses" />
      <Stack.Screen name="enterprise/[id]" />
      <Stack.Screen name="enterprise/services" />
      <Stack.Screen name="enterprise/products" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="search-data" />
      <Stack.Screen name="chat/[id]" />
      </Stack>
    </>
  );
}
