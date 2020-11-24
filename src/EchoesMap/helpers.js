import { secColors } from "./canvas/theme";
import { interpolateRgb } from "d3-interpolate";

export function debounce(fn, wait, ctx=this) {
  let timer;

  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(ctx, args);
      timer = null;
    }, wait);
  };
}

/* Credit to Stephan https://stackoverflow.com/a/26281477. Thank you! */
export function wrapText(text, maxChars) {
  var ret = [];
  var words = text.split(/\b/);

  var currentLine = '';
  var lastWhite = '';
  words.forEach(function(d) {
      var prev = currentLine;
      currentLine += lastWhite + d;

      var l = currentLine.length;

      if (l > maxChars) {
          ret.push(prev.trim());
          currentLine = d;
          lastWhite = '';
      } else {
          var m = currentLine.match(/(.*)(\s+)$/);
          lastWhite = (m && m.length === 3 && m[2]) || '';
          currentLine = (m && m.length === 3 && m[1]) || currentLine;
      }
  });

  if (currentLine) {
      ret.push(currentLine.trim());
  }

  return ret.join("\n");
}

export function getSecColor(sec) {
  return sec && secColors[sec.toString()];
}

// lerp calculates the linear interpolation of `value` between a range `from` to
// a range `to`
export function lerp(from, to, value) {
  const [x, y] = from;
  const [x2, y2] = to;
  let newValue = (x2*(y-value)+y2*(value-x)) / (y-x);
  newValue = Math.max(x2, newValue);
  newValue = Math.min(y2, newValue);
  return newValue;
}

export function lerpColor(from, to, value) {
  const i = interpolateRgb(from, to)
  return i(value);
}

export function interpolateColor(color1, color2, factor) {
  if (arguments.length < 3) { factor = 0.5; }
  var result = color1.slice();
  for (var i=0;i<3;i++) {
    result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
  }
  return result;
};