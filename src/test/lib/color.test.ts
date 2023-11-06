import * as assert from 'assert';
import { parse } from '../../lib/color';

const conversions = {
  '#0008': {
    hex: '#00000087',
    hsl3: 'hsla(0, 0%, 0%, 0.53)',
    hsl4: 'hsl(0 0% 0% / 0.53)',
    rgb3: 'rgba(0, 0, 0, 0.53)',
    rgb4: 'rgb(0 0 0 / 0.53)',
  },
  '#00f': {
    hex: '#0000ff',
    hsl3: 'hsl(240, 100%, 50%)',
    hsl4: 'hsl(240 100% 50%)',
    rgb3: 'rgb(0, 0, 255)',
    rgb4: 'rgb(0 0 255)',
  },
  '#1e90ff': {
    hex: '#1e90ff',
    hsl3: 'hsl(210, 100%, 56%)',
    hsl4: 'hsl(210 100% 56%)',
    rgb3: 'rgb(30, 144, 255)',
    rgb4: 'rgb(30 144 255)',
  },
  '#7ed321cc': {
    hex: '#7ed321cc',
    hsl3: 'hsla(89, 73%, 48%, 0.8)',
    hsl4: 'hsl(89 73% 48% / 0.8)',
    rgb3: 'rgba(126, 211, 33, 0.8)',
    rgb4: 'rgb(126 211 33 / 0.8)',
  },
  '#98fb98aa': {
    hex: '#98fb98ab',
    hsl3: 'hsla(120, 93%, 79%, 0.67)',
    hsl4: 'hsl(120 93% 79% / 0.67)',
    rgb3: 'rgba(152, 251, 152, 0.67)',
    rgb4: 'rgb(152 251 152 / 0.67)',
  },
  '#ff5733': {
    hex: '#ff5733',
    hsl3: 'hsl(11, 100%, 60%)',
    hsl4: 'hsl(11 100% 60%)',
    rgb3: 'rgb(255, 87, 51)',
    rgb4: 'rgb(255 87 51)',
  },
  '#ff69b480': {
    hex: '#ff69b480',
    hsl3: 'hsla(330, 100%, 71%, 0.5)',
    hsl4: 'hsl(330 100% 71% / 0.5)',
    rgb3: 'rgba(255, 105, 180, 0.5)',
    rgb4: 'rgb(255 105 180 / 0.5)',
  },
  '#ffdead': {
    hex: '#ffdead',
    hsl3: 'hsl(36, 100%, 84%)',
    hsl4: 'hsl(36 100% 84%)',
    rgb3: 'rgb(255, 222, 173)',
    rgb4: 'rgb(255 222 173)',
  },
  'hsl(0deg 0% 0% / 0.8)': {
    hex: '#000000cc',
    hsl3: 'hsla(0, 0%, 0%, 0.8)',
    hsl4: 'hsl(0 0% 0% / 0.8)',
    rgb3: 'rgba(0, 0, 0, 0.8)',
    rgb4: 'rgb(0 0 0 / 0.8)',
  },
  'hsl(120deg 100% 25%)': {
    hex: '#008000',
    hsl3: 'hsl(120, 100%, 25%)',
    hsl4: 'hsl(120 100% 25%)',
    rgb3: 'rgb(0, 128, 0)',
    rgb4: 'rgb(0 128 0)',
  },
  'hsl(120deg 75% 60%)': {
    hex: '#4de64d',
    hsl3: 'hsl(120, 75%, 60%)',
    hsl4: 'hsl(120 75% 60%)',
    rgb3: 'rgb(77, 230, 77)',
    rgb4: 'rgb(77 230 77)',
  },
  'hsl(172deg 67% 45% / 0.6)': {
    hex: '#26c0ab99',
    hsl3: 'hsla(172, 67%, 45%, 0.6)',
    hsl4: 'hsl(172 67% 45% / 0.6)',
    rgb3: 'rgba(38, 192, 171, 0.6)',
    rgb4: 'rgb(38 192 171 / 0.6)',
  },
  'hsl(180deg 100% 30%)': {
    hex: '#009999',
    hsl3: 'hsl(180, 100%, 30%)',
    hsl4: 'hsl(180 100% 30%)',
    rgb3: 'rgb(0, 153, 153)',
    rgb4: 'rgb(0 153 153)',
  },
  'hsl(210, 50%, 40%)': {
    hex: '#336699',
    hsl3: 'hsl(210, 50%, 40%)',
    hsl4: 'hsl(210 50% 40%)',
    rgb3: 'rgb(51, 102, 153)',
    rgb4: 'rgb(51 102 153)',
  },
  'hsl(240 60% 70% / 0.5)': {
    hex: '#8585e080',
    hsl3: 'hsla(240, 60%, 70%, 0.5)',
    hsl4: 'hsl(240 60% 70% / 0.5)',
    rgb3: 'rgba(133, 133, 224, 0.5)',
    rgb4: 'rgb(133 133 224 / 0.5)',
  },
  'hsl(30deg 100% 50%)': {
    hex: '#ff8000',
    hsl3: 'hsl(30, 100%, 50%)',
    hsl4: 'hsl(30 100% 50%)',
    rgb3: 'rgb(255, 128, 0)',
    rgb4: 'rgb(255 128 0)',
  },
  'hsl(32deg, 100%, 50%)': {
    hex: '#ff8800',
    hsl3: 'hsl(32, 100%, 50%)',
    hsl4: 'hsl(32 100% 50%)',
    rgb3: 'rgb(255, 136, 0)',
    rgb4: 'rgb(255 136 0)',
  },
  'hsl(360, 100%, 50%)': {
    hex: '#ff0000',
    hsl3: 'hsl(0, 100%, 50%)',
    hsl4: 'hsl(0 100% 50%)',
    rgb3: 'rgb(255, 0, 0)',
    rgb4: 'rgb(255 0 0)',
  },
  'hsla(240deg 60% 70% / 0.8)': {
    hex: '#8585e0cc',
    hsl3: 'hsla(240, 60%, 70%, 0.8)',
    hsl4: 'hsl(240 60% 70% / 0.8)',
    rgb3: 'rgba(133, 133, 224, 0.8)',
    rgb4: 'rgb(133 133 224 / 0.8)',
  },
  'hsla(280, 50%, 20%, 0.9)': {
    hex: '#3c1a4de6',
    hsl3: 'hsla(280, 50%, 20%, 0.9)',
    hsl4: 'hsl(280 50% 20% / 0.9)',
    rgb3: 'rgba(60, 26, 77, 0.9)',
    rgb4: 'rgb(60 26 77 / 0.9)',
  },
  'hsla(30, 100%, 50%, 0.15)': {
    hex: '#ff800026',
    hsl3: 'hsla(30, 100%, 50%, 0.15)',
    hsl4: 'hsl(30 100% 50% / 0.15)',
    rgb3: 'rgba(255, 128, 0, 0.15)',
    rgb4: 'rgb(255 128 0 / 0.15)',
  },
  'hsla(300, 100%, 50%, 0.5)': {
    hex: '#ff00ff80',
    hsl3: 'hsla(300, 100%, 50%, 0.5)',
    hsl4: 'hsl(300 100% 50% / 0.5)',
    rgb3: 'rgba(255, 0, 255, 0.5)',
    rgb4: 'rgb(255 0 255 / 0.5)',
  },
  'hsla(60deg 100% 50% / 0.7)': {
    hex: '#ffff00b3',
    hsl3: 'hsla(60, 100%, 50%, 0.7)',
    hsl4: 'hsl(60 100% 50% / 0.7)',
    rgb3: 'rgba(255, 255, 0, 0.7)',
    rgb4: 'rgb(255 255 0 / 0.7)',
  },
  'hsla(60deg 70% 80% / 0.9)': {
    hex: '#f0f0a8e6',
    hsl3: 'hsla(60, 70%, 80%, 0.9)',
    hsl4: 'hsl(60 70% 80% / 0.9)',
    rgb3: 'rgba(240, 240, 168, 0.9)',
    rgb4: 'rgb(240 240 168 / 0.9)',
  },
  'hsla(88deg 50% 60% / 0.4)': {
    hex: '#9ccc6666',
    hsl3: 'hsla(88, 50%, 60%, 0.4)',
    hsl4: 'hsl(88 50% 60% / 0.4)',
    rgb3: 'rgba(156, 204, 102, 0.4)',
    rgb4: 'rgb(156 204 102 / 0.4)',
  },
  'rgb(0 0 0 / 50%)': {
    hex: '#00000080',
    hsl3: 'hsla(0, 0%, 0%, 0.5)',
    hsl4: 'hsl(0 0% 0% / 0.5)',
    rgb3: 'rgba(0, 0, 0, 0.5)',
    rgb4: 'rgb(0 0 0 / 0.5)',
  },
  'rgb(0 128 255)': {
    hex: '#0080ff',
    hsl3: 'hsl(210, 100%, 50%)',
    hsl4: 'hsl(210 100% 50%)',
    rgb3: 'rgb(0, 128, 255)',
    rgb4: 'rgb(0 128 255)',
  },
  'rgb(0% 50% 100%)': {
    hex: '#0080ff',
    hsl3: 'hsl(210, 100%, 50%)',
    hsl4: 'hsl(210 100% 50%)',
    rgb3: 'rgb(0, 128, 255)',
    rgb4: 'rgb(0 128 255)',
  },
  'rgb(12.5% 25% 37.5%)': {
    hex: '#204060',
    hsl3: 'hsl(210, 50%, 25%)',
    hsl4: 'hsl(210 50% 25%)',
    rgb3: 'rgb(32, 64, 96)',
    rgb4: 'rgb(32 64 96)',
  },
  'rgb(168, 144, 212)': {
    hex: '#a890d4',
    hsl3: 'hsl(261, 44%, 70%)',
    hsl4: 'hsl(261 44% 70%)',
    rgb3: 'rgb(168, 144, 212)',
    rgb4: 'rgb(168 144 212)',
  },
  'rgb(220 20 60 / 0.8)': {
    hex: '#dc143ccc',
    hsl3: 'hsla(348, 83%, 47%, 0.8)',
    hsl4: 'hsl(348 83% 47% / 0.8)',
    rgb3: 'rgba(220, 20, 60, 0.8)',
    rgb4: 'rgb(220 20 60 / 0.8)',
  },
  'rgb(245, 245, 220)': {
    hex: '#f5f5dc',
    hsl3: 'hsl(60, 56%, 91%)',
    hsl4: 'hsl(60 56% 91%)',
    rgb3: 'rgb(245, 245, 220)',
    rgb4: 'rgb(245 245 220)',
  },
  'rgb(255 205 210 / 0.7)': {
    hex: '#ffcdd2b3',
    hsl3: 'hsla(354, 100%, 90%, 0.7)',
    hsl4: 'hsl(354 100% 90% / 0.7)',
    rgb3: 'rgba(255, 205, 210, 0.7)',
    rgb4: 'rgb(255 205 210 / 0.7)',
  },
  'rgb(255, 159, 64)': {
    hex: '#ff9f40',
    hsl3: 'hsl(30, 100%, 63%)',
    hsl4: 'hsl(30 100% 63%)',
    rgb3: 'rgb(255, 159, 64)',
    rgb4: 'rgb(255 159 64)',
  },
  'rgb(33%, 67%, 20%)': {
    hex: '#54ab33',
    hsl3: 'hsl(103, 54%, 44%)',
    hsl4: 'hsl(103 54% 44%)',
    rgb3: 'rgb(84, 171, 51)',
    rgb4: 'rgb(84 171 51)',
  },
  'rgb(77%, 25%, 85%)': {
    hex: '#c440d9',
    hsl3: 'hsl(292, 67%, 55%)',
    hsl4: 'hsl(292 67% 55%)',
    rgb3: 'rgb(196, 64, 217)',
    rgb4: 'rgb(196 64 217)',
  },
  'rgba(0% 100% 0% / 0.3)': {
    hex: '#00ff004d',
    hsl3: 'hsla(120, 100%, 50%, 0.3)',
    hsl4: 'hsl(120 100% 50% / 0.3)',
    rgb3: 'rgba(0, 255, 0, 0.3)',
    rgb4: 'rgb(0 255 0 / 0.3)',
  },
  'rgba(100%, 50%, 0%, 0.7)': {
    hex: '#ff8000b3',
    hsl3: 'hsla(30, 100%, 50%, 0.7)',
    hsl4: 'hsl(30 100% 50% / 0.7)',
    rgb3: 'rgba(255, 128, 0, 0.7)',
    rgb4: 'rgb(255 128 0 / 0.7)',
  },
  'rgba(204, 102, 153, 0.6)': {
    hex: '#cc669999',
    hsl3: 'hsla(330, 50%, 60%, 0.6)',
    hsl4: 'hsl(330 50% 60% / 0.6)',
    rgb3: 'rgba(204, 102, 153, 0.6)',
    rgb4: 'rgb(204 102 153 / 0.6)',
  },
  'rgba(255, 99, 71, 0.6)': {
    hex: '#ff634799',
    hsl3: 'hsla(9, 100%, 64%, 0.6)',
    hsl4: 'hsl(9 100% 64% / 0.6)',
    rgb3: 'rgba(255, 99, 71, 0.6)',
    rgb4: 'rgb(255 99 71 / 0.6)',
  },
  'rgba(33%, 67%, 20%, 0.5)': {
    hex: '#54ab3380',
    hsl3: 'hsla(103, 54%, 44%, 0.5)',
    hsl4: 'hsl(103 54% 44% / 0.5)',
    rgb3: 'rgba(84, 171, 51, 0.5)',
    rgb4: 'rgb(84 171 51 / 0.5)',
  },
  'rgba(65, 105, 225, 0.75)': {
    hex: '#4169e1bf',
    hsl3: 'hsla(225, 73%, 57%, 0.75)',
    hsl4: 'hsl(225 73% 57% / 0.75)',
    rgb3: 'rgba(65, 105, 225, 0.75)',
    rgb4: 'rgb(65 105 225 / 0.75)',
  },
  'rgba(75%, 0%, 130%, 0.3)': {
    hex: '#bf00ff4d',
    hsl3: 'hsla(285, 100%, 50%, 0.3)',
    hsl4: 'hsl(285 100% 50% / 0.3)',
    rgb3: 'rgba(191, 0, 255, 0.3)',
    rgb4: 'rgb(191 0 255 / 0.3)',
  },
  'rgba(77%, 25%, 85%, 0.75)': {
    hex: '#c440d9bf',
    hsl3: 'hsla(292, 67%, 55%, 0.75)',
    hsl4: 'hsl(292 67% 55% / 0.75)',
    rgb3: 'rgba(196, 64, 217, 0.75)',
    rgb4: 'rgb(196 64 217 / 0.75)',
  },
};

Object.entries(conversions).forEach(([input, output]) => {
  test(`toHSL3 converts '${input}' to '${output.hsl3}'`, () => {
    assert.strictEqual(parse(input).toHSL3(), output.hsl3);
  });
});

Object.entries(conversions).forEach(([input, output]) => {
  test(`toHSL4 converts '${input}' to '${output.hsl4}'`, () => {
    assert.strictEqual(parse(input).toHSL4(), output.hsl4);
  });
});

Object.entries(conversions).forEach(([input, output]) => {
  test(`toRGB3 converts '${input}' to '${output.rgb3}'`, () => {
    assert.strictEqual(parse(input).toRGB3(), output.rgb3);
  });
});

Object.entries(conversions).forEach(([input, output]) => {
  test(`toRGB4 converts '${input}' to '${output.rgb4}'`, () => {
    assert.strictEqual(parse(input).toRGB4(), output.rgb4);
  });
});
