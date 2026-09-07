import { Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { authTheme, colors } from '../constants/authTheme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const WAVE_HEIGHT = 48;

function buildWavePaths(width: number, height: number) {
  const mid = width / 2;
  const fillPath = `M0,${height} C${width * 0.1},${height * 0.55} ${width * 0.22},4 ${mid},${height * 0.48} C${width * 0.78},4 ${width * 0.9},${height * 0.55} ${width},${height * 0.42} L${width},${height} L0,${height} Z`;
  const strokePath = `M0,${height * 0.5} C${width * 0.1},${height * 0.55} ${width * 0.22},4 ${mid},${height * 0.48} C${width * 0.78},4 ${width * 0.9},${height * 0.55} ${width},${height * 0.42}`;

  return { fillPath, strokePath };
}

export function WavyTop() {
  const { fillPath, strokePath } = buildWavePaths(SCREEN_WIDTH, WAVE_HEIGHT);

  return (
    <Svg
      width={SCREEN_WIDTH}
      height={WAVE_HEIGHT}
      viewBox={`0 0 ${SCREEN_WIDTH} ${WAVE_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <Path d={fillPath} fill={colors.cardBackground} />
      <Path
        d={strokePath}
        stroke={colors.waveBorder}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
