/* The document stays usable during this decorative introduction. */
(() => {
  'use strict';

  const script = document.currentScript;
  const logoUrl = new URL('assets/logo.jpg', script?.src || location.href).href;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DURATION = 1500;
  let current = null;

  const finish = reason => {
    if (!current) return;
    const { layer, timer, resolve } = current;
    current = null;
    clearTimeout(timer);
    layer.remove();
    resolve({ reason });
    document.dispatchEvent(new CustomEvent('pss:brand-intro-end', { detail: { reason } }));
  };

  const replay = () => {
    finish('replayed');
    if (motion.matches || document.visibilityState === 'hidden' || document.querySelector('dialog[open]')) {
      return Promise.resolve({ reason: 'skipped' });
    }

    const layer = document.createElement('div');
    layer.className = 'brand-intro brand-intro--playing';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = `
      <div class="brand-intro__line"></div>
      <div class="brand-intro__signature">
        <img class="brand-intro__logo" width="132" height="132" alt="">
        <p class="brand-intro__eyebrow">Santé · Mouvement · Accompagnement</p>
        <p class="brand-intro__title">Pôle Santé Sport</p>
        <p class="brand-intro__baseline">À votre rythme. À vos côtés.</p>
        <span class="brand-intro__rule"></span>
      </div>`;
    const logo = layer.querySelector('img');
    logo.src = logoUrl;
    logo.addEventListener('error', () => { logo.hidden = true; }, { once: true });
    document.body.append(layer);

    return new Promise(resolve => {
      current = { layer, resolve, timer: setTimeout(() => finish('completed'), DURATION) };
      layer.addEventListener('animationend', event => {
        if (event.target === layer) finish('completed');
      });
    });
  };

  // The page decides when to play: homepage arrival, after the demo dialog closes.
  // No automatic overlay appears simply because this script was loaded.
  window.PSSBrandIntro = Object.freeze({ play: replay, cancel: () => finish('cancelled') });

  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('[data-replay-brand]');
    if (trigger) replay();
  });

  // Interaction always takes priority. No focus moves and no events are prevented.
  document.addEventListener('pointerdown', () => finish('interaction'), { passive: true, capture: true });
  document.addEventListener('keydown', () => finish('interaction'), { capture: true });
  document.addEventListener('focusin', () => finish('interaction'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') finish('hidden');
  });
  motion.addEventListener('change', () => {
    if (motion.matches) finish('reduced-motion');
  });
})();
