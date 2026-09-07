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
      <Stack.Screen name="checkout/cart" />
      <Stack.Screen name="checkout/address" />
      <Stack.Screen name="checkout/payment" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="notifications-legacy" />
      <Stack.Screen name="notification-preferences" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings-legacy" />
      <Stack.Screen name="search-data" />
      <Stack.Screen name="market/orders" />
      <Stack.Screen name="market/course-learning" />
      <Stack.Screen name="market/cart" />
      <Stack.Screen name="market/checkout" />
      <Stack.Screen name="market/order-confirmed" />
      <Stack.Screen name="market/business-profile" />
      <Stack.Screen name="market/business-chat" />
      <Stack.Screen name="market/pillar" />
      <Stack.Screen name="market/businesses" />
      <Stack.Screen name="market/offers" />
      <Stack.Screen name="market/events" />
      <Stack.Screen name="market/listing" />
      <Stack.Screen name="market/service-detail" />
      <Stack.Screen name="market/event-detail" />
      <Stack.Screen name="coach/consults" />
      <Stack.Screen name="coach/appointments" />
      <Stack.Screen name="coach/chat" />
      <Stack.Screen name="coach/circle" />
      <Stack.Screen name="library/index" />
      <Stack.Screen name="library/reading" />
      <Stack.Screen name="library/listening" />
      <Stack.Screen name="library/watching" />
      <Stack.Screen name="chat/[id]" />
      </Stack>
    </>
  );
}
