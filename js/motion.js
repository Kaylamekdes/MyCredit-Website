/* Direction B motion: load entrances, scroll reveals, scroll progress, figure count-up.
   Runs after ../js/site.js so generated components can be revealed too.
   Nothing loops; nothing moves without a load, a scroll or a tap. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header hairline + scroll progress line */
  const bar = document.querySelector('.progress-top');
  const head = document.querySelector('.site-head');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = root.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      if (head) head.classList.toggle('is-scrolled', scrollY > 8);
      ticking = false;
    });
  };
  /* Butterfly folds its wings as the hero scrolls away (tied to scroll, never looping) */
  const bfly = document.querySelector('.bfly');
  const hero = document.querySelector('.hero');
  if (bfly && hero && !reduce) {
    let pending = false;
    const fold = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.8)));
        bfly.style.setProperty('--fold', (1 - p * 0.6).toFixed(3));
        pending = false;
      });
    };
    addEventListener('scroll', fold, { passive: true });
    fold();
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Stagger groups: each child reveals a beat after the previous one */
  document.querySelectorAll('[data-stagger]').forEach((g) => {
    [...g.children].forEach((c, i) => {
      c.style.setProperty('--i', i);
      c.setAttribute('data-reveal', '');
    });
  });
  document.querySelectorAll('.hero .ln, .k-copy .ln').forEach((l, i) => l.firstElementChild.style.setProperty('--i', i));

  /* Load entrance */
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('loaded')));
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 900);

  /* Scroll reveals */
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  /* Result figure counts to its new value. The live region is marked busy while it
     runs, so screen readers announce only the final figure. */
  if (!reduce) {
    document.querySelectorAll('.result-fig').forEach((fig) => {
      const live = fig.closest('[aria-live]');
      let shown = null;
      let written = '';
      let run = 0;
      const mo = new MutationObserver(() => {
        const text = fig.textContent;
        if (text === written) return;
        const m = text.match(/KES ([\d,]+)/);
        if (!m) { shown = null; return; }
        const to = Number(m[1].replace(/,/g, ''));
        const from = shown == null ? Math.round(to * 0.6) : shown;
        if (from === to) { shown = to; return; }
        const id = ++run;
        const t0 = performance.now();
        const dur = shown == null ? 900 : 420;
        if (live) live.setAttribute('aria-busy', 'true');
        const step = (now) => {
          if (id !== run) return;
          const k = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - k, 4);
          shown = Math.round(from + (to - from) * e);
          written = text.replace(m[1], shown.toLocaleString('en-US'));
          fig.textContent = written;
          if (k < 1) requestAnimationFrame(step);
          else if (live) live.removeAttribute('aria-busy');
        };
        requestAnimationFrame(step);
      });
      mo.observe(fig, { childList: true, characterData: true, subtree: true });
    });
  }
})();
