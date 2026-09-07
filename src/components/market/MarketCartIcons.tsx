import Svg, { Path } from 'react-native-svg';

type IconProps = { color?: string; size?: number };

export function MarketCartMinusIcon({ color = '#257d3f', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 12h12" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export function MarketCartPlusIcon({ color = '#257d3f', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 6v12M6 12h12"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MarketCartPromoIcon({ color = '#257d3f', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M4 8V6h16v2M12 12v5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MarketCartChevronIcon({ color = '#a8bdae', size = 17 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m9 18 6-6-6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
