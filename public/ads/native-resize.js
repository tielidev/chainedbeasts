/* Our wrapper measures its natural content; the vendor's ad snippet stays intact. */
(() => {
  let last = 0;
  const report = () => {
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    if (height >= 80 && height !== last) {
      last = height;
      parent.postMessage({ type: 'wiki-native-height', height }, location.origin);
    }
  };
  new ResizeObserver(report).observe(document.body);
  window.addEventListener('load', report);
  report();
})();
