import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color?: string; size?: number };

export function OrderConfirmedCheckIcon({
  color = '#257d3f',
  size = 40,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 12.5 4.5 4.5L19 7"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function OrderConfirmedTruckIcon({
  color = '#257d3f',
  size = 19,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx={7} cy={18} r={1.8} stroke={color} strokeWidth={1.8} />
      <Circle cx={17} cy={18} r={1.8} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function OrderConfirmedCalendarIcon({
  color = '#c07c27',
  size = 19,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={5}
        width={18}
        height={16}
        rx={2.5}
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M3 10h18M8 3v4M16 3v4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
