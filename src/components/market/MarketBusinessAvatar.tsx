import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

type MarketBusinessAvatarProps = {
  imageUrl?: string | null;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  size: number;
  borderRadius: number;
  initialsFontSize: number;
  style?: StyleProp<ViewStyle>;
};

/** Shows banner/logo image when available; otherwise initials. */
export function MarketBusinessAvatar({
  imageUrl,
  initials,
  avatarBg,
  avatarColor,
  size,
  borderRadius,
  initialsFontSize,
  style,
}: MarketBusinessAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: avatarBg,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl! }}
          style={[styles.image, { borderRadius }]}
          contentFit="cover"
          transition={0}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.initials, { color: avatarColor, fontSize: initialsFontSize }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '800',
  },
});
