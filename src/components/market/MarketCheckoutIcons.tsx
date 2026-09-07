import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color?: string; size?: number };

export function MarketCheckoutPinIcon({ color = '#257d3f', size = 19 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21c-4.5-2.5-8-6-8-10a8 8 0 0 1 16 0c0 4-3.5 7.5-8 10z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={11} r={2.6} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function MarketCheckoutCheckIcon({ color = '#fff', size = 13 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 12.5 4.5 4.5L19 7"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MarketCheckoutLockIcon({ color = '#fff', size = 17 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={5}
        y={11}
        width={14}
        height={9}
        rx={2}
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MarketCheckoutShieldIcon({
  color = '#257d3f',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="m9 12 2.2 2.2L15.5 10"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
