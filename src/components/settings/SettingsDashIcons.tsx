import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { SettingsIconKind } from '@/components/settings/settingsDashData';

type IconProps = { color?: string; size?: number };

function Base({
  children,
  size = 18,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}

export function SettingsDashChevronIcon({
  color = '#257d3f',
  size = 16,
}: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="m9 18 6-6-6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Base>
  );
}

export function SettingsDashIcon({
  kind,
  color = '#164744',
  size = 18,
}: IconProps & { kind: SettingsIconKind }) {
  switch (kind) {
    case 'user':
      return (
        <Base size={size}>
          <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.7} />
          <Path
            d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Base>
      );
    case 'lock':
      return (
        <Base size={size}>
          <Rect
            x={5}
            y={10}
            width={14}
            height={10}
            rx={2}
            stroke={color}
            strokeWidth={1.7}
          />
          <Path
            d="M8 10V7a4 4 0 0 1 8 0v3"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Base>
      );
    case 'bag':
      return (
        <Base size={size}>
          <Path
            d="M4 8h16l-1.4 11a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8zM9 8V6a3 3 0 0 1 6 0v2"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Base>
      );
    case 'chart':
      return (
        <Base size={size}>
          <Path
            d="M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-6"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Base>
      );
    case 'target':
      return (
        <Base size={size}>
          <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.7} />
          <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.7} />
          <Circle cx={12} cy={12} r={1.2} fill={color} />
        </Base>
      );
    case 'clock':
      return (
        <Base size={size}>
          <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.7} />
          <Path
            d="M12 8v4l3 2"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Base>
      );
    case 'globe':
      return (
        <Base size={size}>
          <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.7} />
          <Path
            d="M4 12h16M12 4c2.5 2.8 2.5 13.2 0 16M12 4c-2.5 2.8-2.5 13.2 0 16"
            stroke={color}
            strokeWidth={1.7}
          />
        </Base>
      );
    case 'moon':
      return (
        <Base size={size}>
          <Path
            d="M20 14.5A7.5 7.5 0 0 1 9.5 4 7.5 7.5 0 1 0 20 14.5z"
            stroke={color}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
        </Base>
      );
    case 'shield':
      return (
        <Base size={size}>
          <Path
            d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"
            stroke={color}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
        </Base>
      );
    case 'bell':
      return (
        <Base size={size}>
          <Path
            d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 7H4s2 0 2-7M10 19a2 2 0 0 0 4 0"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Base>
      );
    case 'mail':
      return (
        <Base size={size}>
          <Rect
            x={3}
            y={5}
            width={18}
            height={14}
            rx={2}
            stroke={color}
            strokeWidth={1.7}
          />
          <Path
            d="m4 7 8 6 8-6"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Base>
      );
    case 'chat':
      return (
        <Base size={size}>
          <Path
            d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-5 4z"
            stroke={color}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
        </Base>
      );
    case 'book':
      return (
        <Base size={size}>
          <Path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"
            stroke={color}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
        </Base>
      );
    case 'help':
      return (
        <Base size={size}>
          <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.7} />
          <Path
            d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.5 1-1.5 2.2M12 17h.01"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Base>
      );
    case 'file':
      return (
        <Base size={size}>
          <Path
            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
            stroke={color}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <Path d="M14 3v5h5" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
        </Base>
      );
    case 'logout':
      return (
        <Base size={size}>
          <Path
            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Base>
      );
    case 'trash':
      return (
        <Base size={size}>
          <Path
            d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Base>
      );
  }
}
