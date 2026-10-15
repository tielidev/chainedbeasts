/* Hide empty inventory without changing the network's original snippet. */
(() => {
  const unit = location.pathname.split('/').pop().replace(/\.html$/, '');
  let ready = false;
  let last;
  const report = () => {
    const filled = Array.from(document.body.children).some((node) =>
      node.tagName !== 'SCRIPT' && node.getBoundingClientRect().height >= 40,
    );
    if (!ready && !filled) return;
    if (filled === last) return;
    last = filled;
    parent.postMessage({ type: 'wiki-ad-state', unit, filled }, location.origin);
  };
  new MutationObserver(report).observe(document.body, { childList: true, subtree: true, attributes: true });
  new ResizeObserver(report).observe(document.body);
  setTimeout(() => { ready = true; report(); }, 10000);
  window.addEventListener('load', report);
})();
