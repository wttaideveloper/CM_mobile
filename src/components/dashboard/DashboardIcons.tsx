import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

function stroke(color: string) {
  return {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function Building2Icon({ size = 16, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" {...s} />
      <Path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" {...s} />
      <Path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" {...s} />
      <Path d="M10 6h4" {...s} />
      <Path d="M10 10h4" {...s} />
      <Path d="M10 14h4" {...s} />
      <Path d="M10 18h4" {...s} />
    </Svg>
  );
}

export function DollarSignIcon({ size = 16, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="2" x2="12" y2="22" {...s} />
      <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...s} />
    </Svg>
  );
}

export function PackageIcon({ size = 16, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"
        {...s}
      />
      <Path d="M12 22V12" {...s} />
      <Polyline points="3.29 7 12 12 20.71 7" {...s} />
      <Path d="m7.5 4.27 9 5.15" {...s} />
    </Svg>
  );
}

export function UsersIcon({ size = 16, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...s} />
      <Circle cx={9} cy={7} r={4} {...s} />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" {...s} />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...s} />
    </Svg>
  );
}

export function ChartColumnsIcon({ size = 18, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="20" x2="18" y2="10" {...s} />
      <Line x1="12" y1="20" x2="12" y2="4" {...s} />
      <Line x1="6" y1="20" x2="6" y2="14" {...s} />
    </Svg>
  );
}

export function PlusIcon({ size = 22, color = '#FFFFFF' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14" {...s} />
      <Path d="M12 5v14" {...s} />
    </Svg>
  );
}

export function CalendarIcon({ size = 22, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 2v4" {...s} />
      <Path d="M16 2v4" {...s} />
      <Rect x={3} y={4} width={18} height={18} rx={2} {...s} />
      <Path d="M3 10h18" {...s} />
    </Svg>
  );
}

export function BookOpenIcon({ size = 22, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 7v14" {...s} />
      <Path
        d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
        {...s}
      />
    </Svg>
  );
}

export function CircleCheckIcon({ size = 14, color = '#059669' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21.801 10A10 10 0 1 1 17 3.335" {...s} />
      <Path d="m9 11 3 3L22 4" {...s} />
    </Svg>
  );
}

export function BellIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10.268 21a2 2 0 0 0 3.464 0" {...s} />
      <Path
        d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
        {...s}
      />
    </Svg>
  );
}

export function HouseIcon({ size = 20, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" {...s} />
      <Path
        d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        {...s}
      />
    </Svg>
  );
}

export function ShoppingCartIcon({ size = 20, color = '#9CA3AF' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={8} cy={21} r={1} {...s} />
      <Circle cx={19} cy={21} r={1} {...s} />
      <Path
        d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
        {...s}
      />
    </Svg>
  );
}

export function CalendarDaysIcon({ size = 20, color = '#9CA3AF' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 2v4" {...s} />
      <Path d="M16 2v4" {...s} />
      <Rect x={3} y={4} width={18} height={18} rx={2} {...s} />
      <Path d="M3 10h18" {...s} />
      <Path d="M8 14h.01" {...s} />
      <Path d="M12 14h.01" {...s} />
      <Path d="M16 14h.01" {...s} />
      <Path d="M8 18h.01" {...s} />
      <Path d="M12 18h.01" {...s} />
      <Path d="M16 18h.01" {...s} />
    </Svg>
  );
}

export function UserIcon({ size = 20, color = '#9CA3AF' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" {...s} />
      <Circle cx={12} cy={7} r={4} {...s} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = '#C5D5CC' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m9 18 6-6-6-6" {...s} />
    </Svg>
  );
}

export function LogOutIcon({ size = 18, color = '#DC2626' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...s} />
      <Polyline points="16 17 21 12 16 7" {...s} />
      <Line x1={21} y1={12} x2={9} y2={12} {...s} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 22, color = '#FFFFFF' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m15 18-6-6 6-6" {...s} />
    </Svg>
  );
}

export function MoreVerticalIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={1} fill={color} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={1} fill={color} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={19} r={1} fill={color} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function BadgeCheckIcon({ size = 14, color = '#4CAF50' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        {...s}
      />
      <Path d="m9 12 2 2 4-4" {...s} />
    </Svg>
  );
}

export function SearchIcon({ size = 18, color = '#5a7a70' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={8} {...s} />
      <Path d="m21 21-4.3-4.3" {...s} />
    </Svg>
  );
}

export function FunnelIcon({ size = 16, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"
        {...s}
      />
    </Svg>
  );
}

export function WrenchIcon({ size = 22, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        {...s}
      />
    </Svg>
  );
}

export function StarIcon({ size = 12, color = '#F59E0B' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M12 2l3.09 6.26L20 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l4.91-1.01L12 2z"
        stroke={color}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LucideStarIcon({ size = 15, color = '#F59E0B' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
        {...s}
      />
    </Svg>
  );
}

export function HeartIcon({ size = 20, color = '#1F5D4E' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        {...s}
      />
    </Svg>
  );
}

export function ClockIcon({ size = 14, color = '#5a7a70' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} {...s} />
      <Polyline points="12 6 12 12 16 14" {...s} />
    </Svg>
  );
}

export function MapPinIcon({ size = 14, color = '#5a7a70' }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C10.539 20.193 5 14.993 5 10a7 7 0 0 1 14 0"
        {...s}
      />
      <Circle cx={12} cy={10} r={3} {...s} />
    </Svg>
  );
}

export function TabIcon({
  name,
  color,
  size = 20,
}: {
  name: 'home' | 'explore' | 'shop' | 'events' | 'profile';
  color: string;
  size?: number;
}) {
  switch (name) {
    case 'home':
      return <HouseIcon size={size} color={color} />;
    case 'explore':
      return <Building2Icon size={size} color={color} />;
    case 'shop':
      return <ShoppingCartIcon size={size} color={color} />;
    case 'events':
      return <CalendarDaysIcon size={size} color={color} />;
    case 'profile':
      return <UserIcon size={size} color={color} />;
  }
}

export function QuickActionIcon({
  name,
  color,
}: {
  name: 'add' | 'events' | 'courses' | 'reports';
  color: string;
}) {
  switch (name) {
    case 'add':
      return <PlusIcon size={22} color={color} />;
    case 'events':
      return <CalendarDaysIcon size={18} color={color} />;
    case 'courses':
      return <BookOpenIcon size={18} color={color} />;
    case 'reports':
      return <ChartColumnsIcon size={18} color={color} />;
  }
}

export function ActivityIcon({
  name,
  color,
}: {
  name: 'package' | 'check' | 'building';
  color: string;
}) {
  switch (name) {
    case 'package':
      return <PackageIcon size={14} color={color} />;
    case 'check':
      return <CircleCheckIcon size={14} color={color} />;
    case 'building':
      return <Building2Icon size={14} color={color} />;
  }
}

export function StatIcon({
  name,
  color,
}: {
  name: 'building' | 'dollar' | 'package' | 'users';
  color: string;
}) {
  switch (name) {
    case 'building':
      return <Building2Icon size={16} color={color} />;
    case 'dollar':
      return <DollarSignIcon size={16} color={color} />;
    case 'package':
      return <PackageIcon size={16} color={color} />;
    case 'users':
      return <UsersIcon size={16} color={color} />;
  }
}
