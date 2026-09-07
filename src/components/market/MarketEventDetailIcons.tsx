import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color?: string; size?: number };

export function EventDetailCalendarIcon({
  color = '#8fbd9a',
  size = 52,
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
        strokeWidth={1.4}
      />
      <Path
        d="M3 10h18M8 3v4M16 3v4"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function EventDetailCalSmallIcon({
  color = '#257d3f',
  size = 18,
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

export function EventDetailPersonIcon({
  color = '#257d3f',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.4} stroke={color} strokeWidth={1.8} />
      <Path
        d="M5 21a7 7 0 0 1 14 0"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
