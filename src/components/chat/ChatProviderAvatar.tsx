import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';

export function ChatProviderAvatar({
  initial,
  isGroup,
}: {
  initial: string;
  isGroup?: boolean;
}) {
  const size = isSmallDevice ? 36 : 40;

  if (isGroup) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#EAF4EC',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: PRIMARY,
        }}
      >
        <Ionicons name="people" size={isSmallDevice ? 18 : 20} color={PRIMARY} />
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: size / 2,
        overflow: 'hidden',
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="chatAvatarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F5D4E" />
            <Stop offset="1" stopColor="#3E7041" />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#chatAvatarGrad)" />
      </Svg>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarText: {
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 15 : 16,
    zIndex: 1,
  },
});
