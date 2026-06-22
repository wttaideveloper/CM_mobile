import { Stack } from 'expo-router';

export default function EventsTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="courses" />
      <Stack.Screen name="appointments" />
    </Stack>
  );
}
