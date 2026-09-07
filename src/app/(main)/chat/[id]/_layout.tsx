import { Stack } from 'expo-router';

// TEMP: commented for client demo screen recording (black screen). Re-enable after.
// import { useScreenPrivacy } from '@/hooks/useScreenPrivacy';

export default function ChatConversationLayout() {
  // useScreenPrivacy('chat-conversation');
  return <Stack screenOptions={{ headerShown: false }} />;
}
