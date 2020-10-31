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