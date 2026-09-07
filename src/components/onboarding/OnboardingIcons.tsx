import Svg, { Circle, Path, Polyline } from 'react-native-svg';

import type { OnboardingIconName } from '@/constants/onboarding';

const ICON_COLOR = '#1F5D4E';
const ICON_SIZE = 32;

const strokeProps = {
  stroke: ICON_COLOR,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

type OnboardingIconProps = {
  name: OnboardingIconName;
  size?: number;
};

function Building2Icon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" {...strokeProps} />
      <Path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" {...strokeProps} />
      <Path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" {...strokeProps} />
      <Path d="M10 6h4" {...strokeProps} />
      <Path d="M10 10h4" {...strokeProps} />
      <Path d="M10 14h4" {...strokeProps} />
      <Path d="M10 18h4" {...strokeProps} />
    </Svg>
  );
}

function PackageIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"
        {...strokeProps}
      />
      <Path d="M12 22V12" {...strokeProps} />
      <Polyline points="3.29 7 12 12 20.71 7" {...strokeProps} />
      <Path d="m7.5 4.27 9 5.15" {...strokeProps} />
    </Svg>
  );
}

function UsersIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...strokeProps} />
      <Circle cx={9} cy={7} r={4} {...strokeProps} />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" {...strokeProps} />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...strokeProps} />
    </Svg>
  );
}

export function OnboardingIcon({ name, size = ICON_SIZE }: OnboardingIconProps) {
  switch (name) {
    case 'building':
      return <Building2Icon size={size} />;
    case 'package':
      return <PackageIcon size={size} />;
    case 'users':
      return <UsersIcon size={size} />;
  }
}
