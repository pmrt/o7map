import { secColors } from "./canvas/theme";

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