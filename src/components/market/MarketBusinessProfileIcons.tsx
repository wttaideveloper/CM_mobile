import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color?: string; size?: number };

export function BizProfileShareIcon({ color = '#fff', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.6 13.5 15.4 17M15.4 7 8.6 10.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={18} cy={5.5} r={2.8} stroke={color} strokeWidth={2} />
      <Circle cx={6} cy={12} r={2.8} stroke={color} strokeWidth={2} />
      <Circle cx={18} cy={18.5} r={2.8} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function BizProfilePinIcon({ color = '#257d3f', size = 18 }: IconProps) {
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

export function BizProfileGlobeIcon({
  color = '#257d3f',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path
        d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BizProfileMailIcon({ color = '#257d3f', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={5}
        width={18}
        height={14}
        rx={2.5}
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="m3.6 6.4 8.4 6 8.4-6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BizProfileClockIcon({
  color = '#257d3f',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 7.5V12l3 2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BizProfileMonitorIcon({
  color = '#3c63c8',
  size = 22,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6h16v12H4zM8 18v2M16 18v2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
