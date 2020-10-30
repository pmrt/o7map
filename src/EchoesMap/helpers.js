export function log(msg) {
  console.log(`%c ${msg}`, `background: #000000; color: #c1fadb`);
}

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