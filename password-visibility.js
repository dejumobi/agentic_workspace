(() => {
  'use strict';

  const style = document.createElement('style');
  style.textContent = '.passwordVisibilityToggle{margin:4px 0 0;padding:2px 0;border:0;background:transparent;color:inherit;font:inherit;text-decoration:underline;cursor:pointer}.passwordVisibilityToggle:focus-visible{outline:2px solid currentColor;outline-offset:2px}';
  document.head.append(style);

  function attach(input) {
    if (input.dataset.visibilityToggle === 'true') return;
    input.dataset.visibilityToggle = 'true';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'passwordVisibilityToggle';
    button.textContent = 'Show password';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.textContent = visible ? 'Hide password' : 'Show password';
      button.setAttribute('aria-pressed', String(visible));
      input.focus();
    });
    const label = input.closest('label');
    if (label) label.insertAdjacentElement('afterend', button);
    else input.insertAdjacentElement('afterend', button);
  }

  function scan(root = document) {
    if (root.matches?.('input[type="password"]')) attach(root);
    root.querySelectorAll?.('input[type="password"]').forEach(attach);
  }

  scan();
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) scan(node);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
})();