import { hexToRgb, isDark, rgbToHex, shadeColor } from '../../src/lib/color.js';

/**
 * @typedef {import('./ansi.types.js').AnsiPalette} AnsiPalette
 */

const GOGH_COLORS = {
  black: 'color_01',
  red: 'color_02',
  green: 'color_03',
  yellow: 'color_04',
  blue: 'color_05',
  magenta: 'color_06',
  cyan: 'color_07',
  white: 'color_08',
  'bright-black': 'color_09',
  'bright-red': 'color_10',
  'bright-green': 'color_11',
  'bright-yellow': 'color_12',
  'bright-blue': 'color_13',
  'bright-magenta': 'color_14',
  'bright-cyan': 'color_15',
  'bright-white': 'color_16',
  foreground: 'foreground',
  background: 'background',
};
const GOGH_PALETTES_URL = 'https://raw.githubusercontent.com/Gogh-Co/Gogh/master/data/themes.json';

/**
 * @return {Promise<{[p: string]: AnsiPalette}>}
 */
export async function getGoghPalettes() {
  const response = await fetch(new URL(GOGH_PALETTES_URL));
  const palettes = await response.json();
  return Object.fromEntries(palettes.map((p) => [p.name, convert(p)]));
}

/**
 *
 * @param goghPalette
 * @return {AnsiPalette}
 */
function convert(goghPalette) {
  const palette = Object.fromEntries(
    Object.entries(GOGH_COLORS).map(([colorName, goghColorName]) => {
      return [colorName, goghPalette[goghColorName]];
    }),
  );

  const background = hexToRgb(palette.background);
  const shadeDirection = isDark(background) ? +1 : -1;
  palette['background-hover'] = rgbToHex(shadeColor(background, shadeDirection * 4));
  palette['background-selected'] = rgbToHex(shadeColor(background, shadeDirection * 8));

  return palette;
}
