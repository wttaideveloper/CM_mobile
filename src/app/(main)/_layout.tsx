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
      <Stack.Screen name="hwi" />
      <Stack.Screen name="check-in" />
      <Stack.Screen name="profile-settings" />
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
      <Stack.Screen name="market/my-trainings" />
      <Stack.Screen name="market/my-training-progress" />
      <Stack.Screen name="market/my-events" />
      <Stack.Screen name="market/course-learning" />
      <Stack.Screen name="market/cart" />
      <Stack.Screen name="market/checkout" />
      <Stack.Screen name="market/address" />
      <Stack.Screen name="market/order-confirmed" />
      <Stack.Screen name="market/business-profile" />
      <Stack.Screen name="market/business-chat" />
      <Stack.Screen name="market/pillar" />
      <Stack.Screen name="market/businesses" />
      <Stack.Screen name="market/offers" />
      <Stack.Screen name="market/events" />
      <Stack.Screen name="market/trainings" />
      <Stack.Screen name="market/training-detail" />
      <Stack.Screen name="market/training-checkout" />
      <Stack.Screen name="market/training-enrolled" />
      <Stack.Screen name="market/training-attend" />
      <Stack.Screen name="market/training-exam" />
      <Stack.Screen name="market/training-reviews" />
      <Stack.Screen name="market/training-wishlist" />
      <Stack.Screen name="market/training-offline" />
      <Stack.Screen name="market/training-notes" />
      <Stack.Screen name="market/training-form" />
      <Stack.Screen name="market/training-sessions" />
      <Stack.Screen name="market/training-trainer" />
      <Stack.Screen name="market/training-materials" />
      <Stack.Screen name="market/training-participants" />
      <Stack.Screen name="market/training-attendance" />
      <Stack.Screen name="market/training-completion" />
      <Stack.Screen name="market/training-certificates" />
      <Stack.Screen name="market/training-approval" />
      <Stack.Screen name="market/training-status" />
      <Stack.Screen name="market/training-notifications" />
      <Stack.Screen name="market/training-analytics" />
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
