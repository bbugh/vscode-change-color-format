import {
  colord,
  // extend,
  type Colord,
} from 'colord';
// import lchPlugin from 'colord/plugins/lch';
// import labPlugin from 'colord/plugins/lab';
// import hwbPlugin from 'colord/plugins/hwb';

// extend([lchPlugin, labPlugin, hwbPlugin]);

export function parse(colorString: string): Color {
  const color = colord(colorString);

  if (color.isValid()) return new Color(color);

  throw new Error(`Could not convert color '${colorString}', unknown format.`);
}

// well it works
function level3tolevel4(color: string): string {
  return color
    .replace(/^(hsl|rgb)a/, '$1')
    .replace(',', '')
    .replace(',', '')
    .replace(',', ' /');
}

export class Color {
  #internal: Colord;

  constructor(colord: Colord) {
    this.#internal = colord;
  }

  toHex(): string {
    return this.#internal.toHex();
  }

  toHSL3(): string {
    return this.#internal.toHslString();
  }

  toHSL4(): string {
    return level3tolevel4(this.toHSL3());
  }

  toRGB3(): string {
    return this.#internal.toRgbString();
  }

  toRGB4(): string {
    return level3tolevel4(this.toRGB3());
  }
}
