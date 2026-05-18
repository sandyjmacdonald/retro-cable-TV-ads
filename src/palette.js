// PICO-8 16-colour palette — reference colours by index 0–15
export const PALETTE = [
  '#000000', // 0  black
  '#1D2B53', // 1  dark-blue
  '#7E2553', // 2  dark-purple
  '#008751', // 3  dark-green
  '#AB5236', // 4  brown
  '#5F574F', // 5  dark-grey
  '#C2C3C7', // 6  light-grey
  '#FFF1E8', // 7  white
  '#FF004D', // 8  red
  '#FFA300', // 9  orange
  '#FFEC27', // 10 yellow
  '#00E436', // 11 green
  '#29ADFF', // 12 blue
  '#83769C', // 13 lavender
  '#FF77A8', // 14 pink
  '#FFCCAA', // 15 peach
];

export const color = (n) => PALETTE[Math.max(0, Math.min(15, n | 0))];
